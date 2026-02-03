import { execa } from 'execa';
import fg from 'fast-glob';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';

import { ToolDetectorManager } from '@/core/infrastructure/ToolDetectorManager';
import { FileResult, SearchOptions } from '@/types/fileSearch';
import { createLogger } from '@/utils/logger';

import { FileSearchImpl } from '../type';

const statPromise = promisify(fs.stat);

// Create logger
const logger = createLogger('module:FileSearch:macOS');

/**
 * Fallback tool type for file search
 * Priority: mdfind > fd > find > fast-glob
 */
type FallbackTool = 'mdfind' | 'fd' | 'find' | 'fast-glob';

export class MacOSSearchServiceImpl extends FileSearchImpl {
  /**
   * Cache for Spotlight availability status
   * null = not checked, true = available, false = not available
   */
  private spotlightAvailable: boolean | null = null;

  /**
   * Current fallback tool being used
   */
  private currentTool: FallbackTool | null = null;

  constructor(toolDetectorManager?: ToolDetectorManager) {
    super(toolDetectorManager);
  }

  /**
   * Perform file search
   * @param options Search options
   * @returns Promise of search result list
   */
  async search(options: SearchOptions): Promise<FileResult[]> {
    // Determine the best available tool on first search
    if (this.currentTool === null) {
      this.currentTool = await this.determineBestTool();
      logger.info(`Using file search tool: ${this.currentTool}`);
    }

    return this.searchWithTool(this.currentTool, options);
  }

  /**
   * Determine the best available tool based on priority
   * Priority: mdfind > fd > find > fast-glob
   */
  private async determineBestTool(): Promise<FallbackTool> {
    if (this.toolDetectorManager) {
      const bestTool = await this.toolDetectorManager.getBestTool('file-search');
      if (bestTool && ['mdfind', 'fd', 'find'].includes(bestTool)) {
        return bestTool as FallbackTool;
      }
    }

    if (await this.checkSpotlightStatus()) {
      return 'mdfind';
    }

    if (await this.checkToolAvailable('fd')) {
      return 'fd';
    }

    if (await this.checkToolAvailable('find')) {
      return 'find';
    }

    return 'fast-glob';
  }

  /**
   * Check if a tool is available
   */
  private async checkToolAvailable(tool: string): Promise<boolean> {
    try {
      await execa('which', [tool], { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Search using the specified tool
   */
  private async searchWithTool(tool: FallbackTool, options: SearchOptions): Promise<FileResult[]> {
    switch (tool) {
      case 'mdfind': {
        return this.searchWithSpotlight(options);
      }
      case 'fd': {
        return this.searchWithFd(options);
      }
      case 'find': {
        return this.searchWithFind(options);
      }
      default: {
        return this.searchWithFastGlob(options);
      }
    }
  }

  /**
   * Fallback to the next available tool
   */
  private async fallbackToNextTool(currentTool: FallbackTool): Promise<FallbackTool> {
    const priority: FallbackTool[] = ['mdfind', 'fd', 'find', 'fast-glob'];
    const currentIndex = priority.indexOf(currentTool);

    // Try each tool after the current one
    for (let i = currentIndex + 1; i < priority.length; i++) {
      const nextTool = priority[i];
      if (nextTool === 'fast-glob') {
        return 'fast-glob'; // Always available
      }
      if (nextTool === 'fd' && (await this.checkToolAvailable('fd'))) {
        return 'fd';
      }
      if (nextTool === 'find' && (await this.checkToolAvailable('find'))) {
        return 'find';
      }
    }

    return 'fast-glob';
  }

  /**
   * Search using Spotlight (mdfind)
   */
  private async searchWithSpotlight(options: SearchOptions): Promise<FileResult[]> {
    // Build the command first, regardless of execution method
    const { cmd, args, commandString } = this.buildSearchCommand(options);
    logger.debug(`Executing command: ${commandString}`);

    try {
      const { stdout, stderr, exitCode } = await execa(cmd, args, {
        reject: false, // Don't throw on non-zero exit code
      });

      if (stderr) {
        logger.warn(`Search stderr: ${stderr}`);
      }

      logger.debug(`Search process exited with code ${exitCode}`);

      // Parse stdout to get file paths
      const results = stdout
        .trim()
        .split('\n')
        .filter((line) => line.trim());

      // If exited with error code and we have stderr and no results, fallback
      if (exitCode !== 0 && stderr && results.length === 0) {
        if (!stderr.includes('Index is unavailable') && !stderr.includes('kMD')) {
          logger.warn(
            `Spotlight search failed with code ${exitCode}, falling back to next tool: ${stderr}`,
          );
          this.spotlightAvailable = false;
          this.currentTool = await this.fallbackToNextTool('mdfind');
          logger.info(`Falling back to: ${this.currentTool}`);
          return this.searchWithTool(this.currentTool, options);
        } else {
          logger.warn(
            `Search process exited with code ${exitCode} but contained potentially ignorable errors: ${stderr}`,
          );
        }
      }

      // Apply limit
      const limitedResults =
        options.limit && results.length > options.limit ? results.slice(0, options.limit) : results;

      return this.processSearchResultsFromPaths(limitedResults, options);
    } catch (error) {
      logger.error(`Search process error: ${(error as Error).message}`, error);
      // Fallback to next tool on Spotlight error
      this.spotlightAvailable = false;
      this.currentTool = await this.fallbackToNextTool('mdfind');
      logger.warn(`Spotlight search failed, falling back to: ${this.currentTool}`);
      return this.searchWithTool(this.currentTool, options);
    }
  }

  /**
   * Search using fd (fast find alternative)
   */
  private async searchWithFd(options: SearchOptions): Promise<FileResult[]> {
    const searchDir = options.onlyIn || os.homedir() || '/';
    const limit = options.limit || 30;

    logger.debug('Performing fd search', { keywords: options.keywords, searchDir });

    try {
      const args: string[] = [];

      // Pattern matching
      if (options.keywords) {
        args.push(options.keywords);
      } else {
        args.push('.'); // Match all files
      }

      // Search directory
      args.push(searchDir, '--type', 'f', '--hidden', '--ignore-case', '--max-depth', '10'); // Limit depth for performance
      // eslint-disable-next-line unicorn/no-array-push-push
      args.push(
        '--max-results',
        String(limit),
        '--exclude',
        'node_modules',
        '--exclude',
        '.git',
        '--exclude',
        '*cache*',
      );

      const { stdout, exitCode } = await execa('fd', args, {
        reject: false,
        timeout: 30_000,
      });

      if (exitCode !== 0 && !stdout.trim()) {
        logger.warn(`fd search failed with code ${exitCode}, falling back to next tool`);
        this.currentTool = await this.fallbackToNextTool('fd');
        return this.searchWithTool(this.currentTool, options);
      }

      const files = stdout
        .trim()
        .split('\n')
        .filter((line) => line.trim());

      logger.debug(`fd found ${files.length} files`);

      return this.processSearchResultsFromPaths(files, options);
    } catch (error) {
      logger.error('fd search failed:', error);
      this.currentTool = await this.fallbackToNextTool('fd');
      logger.warn(`fd failed, falling back to: ${this.currentTool}`);
      return this.searchWithTool(this.currentTool, options);
    }
  }

  /**
   * Search using find (Unix standard tool)
   */
  private async searchWithFind(options: SearchOptions): Promise<FileResult[]> {
    const searchDir = options.onlyIn || os.homedir() || '/';
    const limit = options.limit || 30;

    logger.debug('Performing find search', { keywords: options.keywords, searchDir });

    try {
      const args: string[] = [searchDir];

      // Limit depth
      args.push(
        '-maxdepth',
        '10',
        '-type',
        'f',
        '(',
        '-path',
        '*/node_modules/*',
        '-o',
        '-path',
        '*/.git/*',
        '-o',
        '-path',
        '*/*cache*/*',
        ')',
        '-prune',
        '-o',
      );

      // Pattern matching
      if (options.keywords) {
        args.push('-iname', `*${options.keywords}*`);
      }

      args.push('-print');

      const { stdout, exitCode } = await execa('find', args, {
        reject: false,
        timeout: 30_000,
      });

      if (exitCode !== 0 && !stdout.trim()) {
        logger.warn(`find search failed with code ${exitCode}, falling back to fast-glob`);
        this.currentTool = 'fast-glob';
        return this.searchWithFastGlob(options);
      }

      const files = stdout
        .trim()
        .split('\n')
        .filter((line) => line.trim())
        .slice(0, limit);

      logger.debug(`find found ${files.length} files`);

      return this.processSearchResultsFromPaths(files, options);
    } catch (error) {
      logger.error('find search failed:', error);
      this.currentTool = 'fast-glob';
      logger.warn('find failed, falling back to fast-glob');
      return this.searchWithFastGlob(options);
    }
  }

  /**
   * Fallback search using fast-glob when Spotlight is not available
   */
  private async searchWithFastGlob(options: SearchOptions): Promise<FileResult[]> {
    const searchDir = options.onlyIn || os.homedir() || '/';
    const limit = options.limit || 30;

    logger.debug('Performing fast-glob fallback search', { keywords: options.keywords, searchDir });

    try {
      // Build glob pattern from keywords
      const pattern = options.keywords
        ? `**/*${this.escapeGlobPattern(options.keywords)}*`
        : '**/*';

      const files = await fg(pattern, {
        absolute: true,
        caseSensitiveMatch: false,
        cwd: searchDir,
        deep: 10, // Limit depth for performance
        dot: true,
        ignore: ['**/node_modules/**', '**/.git/**', '**/.*cache*/**', '**/Library/Caches/**'],
        onlyFiles: true,
        suppressErrors: true,
      });

      logger.debug(`Fast-glob found ${files.length} files matching pattern`);

      const limitedFiles = files.slice(0, limit);
      return this.processSearchResultsFromPaths(limitedFiles, options);
    } catch (error) {
      logger.error('Fast-glob search failed:', error);
      throw new Error(`File search failed: ${(error as Error).message}`);
    }
  }

  /**
   * Escape special glob characters in the search pattern
   */
  private escapeGlobPattern(pattern: string): string {
    return pattern.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&');
  }

  /**
   * Check search service status
   * @returns Promise indicating if Spotlight service is available
   */
  async checkSearchServiceStatus(): Promise<boolean> {
    return this.checkSpotlightStatus();
  }

  /**
   * Update search index
   * @param path Optional specified path
   * @returns Promise indicating operation success
   */
  async updateSearchIndex(path?: string): Promise<boolean> {
    return this.updateSpotlightIndex(path);
  }

  /**
   * Build mdfind command string
   * @param options Search options
   * @returns Command components (cmd, args array, and command string for logging)
   */
  private buildSearchCommand(options: SearchOptions): {
    args: string[];
    cmd: string;
    commandString: string;
  } {
    // Command and arguments array
    const cmd = 'mdfind';
    const args: string[] = [];

    // macOS mdfind doesn't support -limit parameter, we'll limit results in post-processing

    // Search in specific directory
    if (options.onlyIn) {
      args.push('-onlyin', options.onlyIn);
    }

    // Live update
    if (options.liveUpdate) {
      args.push('-live');
    }

    // Detailed metadata
    if (options.detailed) {
      args.push(
        '-attr',
        'kMDItemDisplayName',
        'kMDItemContentType',
        'kMDItemKind',
        'kMDItemFSSize',
        'kMDItemFSCreationDate',
        'kMDItemFSContentChangeDate',
      );
    }

    // Build query expression
    let queryExpression = '';

    // Basic query
    if (options.keywords) {
      // If the query string doesn't use Spotlight query syntax (doesn't contain kMDItem properties),
      // treat it as a flexible name search rather than exact phrase match
      if (!options.keywords.includes('kMDItem')) {
        // Use kMDItemFSName for filename matching with wildcards for better flexibility
        queryExpression = `kMDItemFSName == "*${options.keywords.replaceAll('"', '\\"')}*"cd`;
      } else {
        queryExpression = options.keywords;
      }
    }

    // File content search
    if (options.contentContains) {
      if (queryExpression) {
        queryExpression = `${queryExpression} && kMDItemTextContent == "*${options.contentContains}*"cd`;
      } else {
        queryExpression = `kMDItemTextContent == "*${options.contentContains}*"cd`;
      }
    }

    // File type filtering
    if (options.fileTypes && options.fileTypes.length > 0) {
      const typeConditions = options.fileTypes
        .map((type) => `kMDItemContentType == "${type}"`)
        .join(' || ');
      if (queryExpression) {
        queryExpression = `${queryExpression} && (${typeConditions})`;
      } else {
        queryExpression = `(${typeConditions})`;
      }
    }

    // Date filtering - Modified date
    if (options.modifiedAfter || options.modifiedBefore) {
      let dateCondition = '';

      if (options.modifiedAfter) {
        const dateString = options.modifiedAfter.toISOString().split('T')[0];
        dateCondition += `kMDItemFSContentChangeDate >= $time.iso(${dateString})`;
      }

      if (options.modifiedBefore) {
        if (dateCondition) dateCondition += ' && ';
        const dateString = options.modifiedBefore.toISOString().split('T')[0];
        dateCondition += `kMDItemFSContentChangeDate <= $time.iso(${dateString})`;
      }

      if (queryExpression) {
        queryExpression = `${queryExpression} && (${dateCondition})`;
      } else {
        queryExpression = dateCondition;
      }
    }

    // Date filtering - Creation date
    if (options.createdAfter || options.createdBefore) {
      let dateCondition = '';

      if (options.createdAfter) {
        const dateString = options.createdAfter.toISOString().split('T')[0];
        dateCondition += `kMDItemFSCreationDate >= $time.iso(${dateString})`;
      }

      if (options.createdBefore) {
        if (dateCondition) dateCondition += ' && ';
        const dateString = options.createdBefore.toISOString().split('T')[0];
        dateCondition += `kMDItemFSCreationDate <= $time.iso(${dateString})`;
      }

      if (queryExpression) {
        queryExpression = `${queryExpression} && (${dateCondition})`;
      } else {
        queryExpression = dateCondition;
      }
    }

    // Add query expression to args
    if (queryExpression) {
      args.push(queryExpression);
    }

    // Build command string for logging
    const commandString = `${cmd} ${args.map((arg) => (arg.includes(' ') || arg.includes('*') ? `"${arg}"` : arg)).join(' ')}`;

    return { args, cmd, commandString };
  }

  /**
   * Process search results from a list of file paths
   * @param filePaths Array of file path strings
   * @param options Search options
   * @returns Formatted file result list
   */
  private async processSearchResultsFromPaths(
    filePaths: string[],
    options: SearchOptions,
  ): Promise<FileResult[]> {
    // Create a result object for each file path
    const resultPromises = filePaths.map(async (filePath) => {
      try {
        // Get file information
        const stats = await statPromise(filePath);

        // Create basic result object
        const result: FileResult = {
          createdTime: stats.birthtime,
          isDirectory: stats.isDirectory(),
          lastAccessTime: stats.atime,
          metadata: {},
          modifiedTime: stats.mtime,
          name: path.basename(filePath),
          path: filePath,
          size: stats.size,
          type: path.extname(filePath).toLowerCase().replace('.', ''),
        };

        // If detailed information is needed and Spotlight is available, get additional metadata
        if (options.detailed && this.spotlightAvailable) {
          result.metadata = await this.getDetailedMetadata(filePath);
        }

        // Determine content type
        result.contentType = this.determineContentType(result.type);

        return result;
      } catch (error) {
        logger.warn(`Error processing file stats for ${filePath}: ${error.message}`, error);
        // Return partial information, even if unable to get complete file stats
        return {
          contentType: 'unknown',
          createdTime: new Date(),
          isDirectory: false,
          lastAccessTime: new Date(),
          modifiedTime: new Date(),
          name: path.basename(filePath),
          path: filePath,
          size: 0,
          type: path.extname(filePath).toLowerCase().replace('.', ''),
        };
      }
    });

    // Wait for all file information processing to complete
    let results = await Promise.all(resultPromises);

    // Sort results
    if (options.sortBy) {
      results = this.sortResults(results, options.sortBy, options.sortDirection);
    }

    // Apply limit here as mdfind doesn't support -limit parameter
    if (options.limit && options.limit > 0 && results.length > options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Get detailed metadata for a file
   * @param filePath File path
   * @returns Metadata object
   */
  private async getDetailedMetadata(filePath: string): Promise<Record<string, any>> {
    try {
      // Use mdls command to get all metadata
      const { stdout } = await execa('mdls', [filePath]);

      // Parse mdls output
      const metadata: Record<string, any> = {};
      const lines = stdout.split('\n');

      let currentKey = '';
      let isMultilineValue = false;
      let multilineValue: string[] = [];

      for (const line of lines) {
        if (isMultilineValue) {
          if (line.includes(')')) {
            // Multiline value ends
            multilineValue.push(line.trim());
            metadata[currentKey] = multilineValue.join(' ');
            isMultilineValue = false;
            multilineValue = [];
          } else {
            // Continue collecting multiline value
            multilineValue.push(line.trim());
          }
          continue;
        }

        const match = line.match(/^(\w+)\s+=\s+(.*)$/);
        if (match) {
          currentKey = match[1];
          const value = match[2].trim();

          // Check for multiline value start
          if (value.includes('(') && !value.includes(')')) {
            isMultilineValue = true;
            multilineValue = [value];
          } else {
            // Process single line value
            metadata[currentKey] = this.parseMetadataValue(value);
          }
        }
      }

      return metadata;
    } catch (error) {
      logger.warn(`Error getting metadata for ${filePath}: ${error.message}`, error);
      return {};
    }
  }

  /**
   * Parse metadata value
   * @param value Metadata raw value string
   * @returns Parsed value
   */
  private parseMetadataValue(input: string): any {
    let value = input;
    // Remove quotes from mdls output
    if (value.startsWith('"') && value.endsWith('"')) {
      // eslint-disable-next-line unicorn/prefer-string-slice
      value = value.substring(1, value.length - 1);
    }

    // Handle special values
    if (value === '(null)') return null;
    if (value === 'Yes' || value === 'true') return true;
    if (value === 'No' || value === 'false') return false;

    // Try to parse date (format like "2023-05-16 14:30:45 +0000")
    const dateMatch = value.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [+-]\d{4})$/);
    if (dateMatch) {
      try {
        return new Date(value);
      } catch {
        // If date parsing fails, return original string
        return value;
      }
    }

    // Try to parse number
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return Number(value);
    }

    // Default return string
    return value;
  }

  /**
   * Sort results
   * @param results Result list
   * @param sortBy Sort field
   * @param direction Sort direction
   * @returns Sorted result list
   */
  private sortResults(
    results: FileResult[],
    sortBy: 'name' | 'date' | 'size',
    direction: 'asc' | 'desc' = 'asc',
  ): FileResult[] {
    const sortedResults = [...results];

    sortedResults.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name': {
          comparison = a.name.localeCompare(b.name);
          break;
        }
        case 'date': {
          comparison = a.modifiedTime.getTime() - b.modifiedTime.getTime();
          break;
        }
        case 'size': {
          comparison = a.size - b.size;
          break;
        }
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return sortedResults;
  }

  /**
   * Check Spotlight service status
   * @returns Promise indicating if Spotlight is available
   */
  private async checkSpotlightStatus(): Promise<boolean> {
    try {
      // Try to run a simple mdfind command to check if Spotlight is working
      // Use a timeout to avoid hanging if Spotlight is completely disabled
      const { stdout } = await execa(
        'mdfind',
        ['-name', 'test', '-onlyin', os.homedir() || '~', '-count'],
        {
          timeout: 5000, // 5 second timeout
        },
      );

      // If mdfind returns a number (even 0), Spotlight is available
      const count = parseInt(stdout.trim(), 10);
      if (Number.isNaN(count)) {
        logger.warn('Spotlight returned invalid response');
        return false;
      }

      return true;
    } catch (error) {
      logger.warn(`Spotlight is not available: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Update Spotlight index
   * @param path Optional specified path
   * @returns Promise indicating operation success
   */
  private async updateSpotlightIndex(path?: string): Promise<boolean> {
    try {
      // mdutil command is used to manage Spotlight index
      await execa('mdutil', ['-E', path || '/']);
      return true;
    } catch (error) {
      logger.error(`Failed to update Spotlight index: ${error.message}`, error);
      return false;
    }
  }
}
