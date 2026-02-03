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

const logger = createLogger('module:FileSearch:windows');

/**
 * Windows file search implementation using fast-glob
 * Falls back to pure Node.js implementation without external tool dependencies
 */
export class WindowsSearchServiceImpl extends FileSearchImpl {
  constructor(toolDetectorManager?: ToolDetectorManager) {
    super(toolDetectorManager);
  }

  async search(options: SearchOptions): Promise<FileResult[]> {
    const searchDir = options.onlyIn || os.homedir() || 'C:\\';
    const limit = options.limit || 30;

    logger.debug('Starting Windows file search', { keywords: options.keywords, searchDir });

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
        dot: false, // Windows hidden files use attributes, not dot prefix
        ignore: [
          '**/node_modules/**',
          '**/.git/**',
          '**/AppData/Local/Temp/**',
          '**/AppData/Local/Microsoft/**',
          '**/$Recycle.Bin/**',
          '**/Windows/**',
          '**/Program Files/**',
          '**/Program Files (x86)/**',
        ],
        onlyFiles: true,
        suppressErrors: true,
      });

      logger.debug(`Found ${files.length} files matching pattern`);

      const limitedFiles = files.slice(0, limit);
      return this.processFilePaths(limitedFiles, options);
    } catch (error) {
      logger.error('Windows search failed:', error);
      throw new Error(`File search failed: ${(error as Error).message}`);
    }
  }

  async checkSearchServiceStatus(): Promise<boolean> {
    // fast-glob is always available as it's bundled with the app
    return true;
  }

  async updateSearchIndex(): Promise<boolean> {
    // Windows Search index is managed by the OS
    // This is a no-op for fast-glob based implementation
    logger.warn('updateSearchIndex is not supported (using fast-glob instead of Windows Search)');
    return false;
  }

  /**
   * Escape special glob characters in the search pattern
   */
  private escapeGlobPattern(pattern: string): string {
    return pattern.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&');
  }

  /**
   * Process file paths and return FileResult objects
   */
  private async processFilePaths(
    filePaths: string[],
    options: SearchOptions,
  ): Promise<FileResult[]> {
    const results: FileResult[] = [];

    for (const filePath of filePaths) {
      try {
        const stats = await statPromise(filePath);
        const ext = path.extname(filePath).toLowerCase().replace('.', '');

        results.push({
          contentType: this.determineContentType(ext),
          createdTime: stats.birthtime,
          isDirectory: stats.isDirectory(),
          lastAccessTime: stats.atime,
          metadata: {},
          modifiedTime: stats.mtime,
          name: path.basename(filePath),
          path: filePath,
          size: stats.size,
          type: ext,
        });
      } catch (error) {
        logger.warn(`Error processing file ${filePath}:`, error);
      }
    }

    return this.sortResults(results, options.sortBy, options.sortDirection);
  }

  /**
   * Sort results based on options
   */
  private sortResults(
    results: FileResult[],
    sortBy?: 'name' | 'date' | 'size',
    direction: 'asc' | 'desc' = 'asc',
  ): FileResult[] {
    if (!sortBy) return results;

    return [...results].sort((a, b) => {
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
  }
}
