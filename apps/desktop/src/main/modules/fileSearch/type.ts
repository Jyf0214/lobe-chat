/* eslint-disable sort-keys-fix/sort-keys-fix */
import { ToolDetectorManager } from '@/core/infrastructure/ToolDetectorManager';
import { FileResult, SearchOptions } from '@/types/fileSearch';

/**
 * Content type mapping for common file extensions
 */
const CONTENT_TYPE_MAP: Record<string, string> = {
  // Archive
  '7z': 'archive',
  'gz': 'archive',
  'rar': 'archive',
  'tar': 'archive',
  'zip': 'archive',
  // Audio
  'aac': 'audio',
  'mp3': 'audio',
  'ogg': 'audio',
  'wav': 'audio',
  // Video
  'avi': 'video',
  'mkv': 'video',
  'mov': 'video',
  'mp4': 'video',
  // Image
  'gif': 'image',
  'heic': 'image',
  'ico': 'image',
  'jpeg': 'image',
  'jpg': 'image',
  'png': 'image',
  'svg': 'image',
  'webp': 'image',
  // Document
  'doc': 'document',
  'docx': 'document',
  'pdf': 'document',
  'rtf': 'text',
  'txt': 'text',
  // Spreadsheet
  'xls': 'spreadsheet',
  'xlsx': 'spreadsheet',
  // Presentation
  'ppt': 'presentation',
  'pptx': 'presentation',
  // Code
  'bat': 'code',
  'c': 'code',
  'cmd': 'code',
  'cpp': 'code',
  'cs': 'code',
  'css': 'code',
  'html': 'code',
  'java': 'code',
  'js': 'code',
  'json': 'code',
  'ps1': 'code',
  'py': 'code',
  'sh': 'code',
  'swift': 'code',
  'ts': 'code',
  'tsx': 'code',
  'vbs': 'code',
  // Application/Installer (platform-specific)
  'app': 'application',
  'deb': 'package',
  'dmg': 'disk-image',
  'exe': 'application',
  'iso': 'disk-image',
  'msi': 'installer',
  'rpm': 'package',
};

/**
 * File Search Service Implementation Abstract Class
 * Defines the interface that different platform file search implementations need to implement
 */
export abstract class FileSearchImpl {
  protected toolDetectorManager?: ToolDetectorManager;

  constructor(toolDetectorManager?: ToolDetectorManager) {
    this.toolDetectorManager = toolDetectorManager;
  }

  /**
   * Set the tool detector manager
   * @param manager ToolDetectorManager instance
   */
  setToolDetectorManager(manager: ToolDetectorManager): void {
    this.toolDetectorManager = manager;
  }

  /**
   * Determine content type from file extension
   * @param extension File extension (without dot)
   * @returns Content type description
   */
  protected determineContentType(extension: string): string {
    return CONTENT_TYPE_MAP[extension.toLowerCase()] || 'unknown';
  }

  /**
   * Perform file search
   * @param options Search options
   * @returns Promise of search result list
   */
  abstract search(options: SearchOptions): Promise<FileResult[]>;

  /**
   * Check search service status
   * @returns Promise indicating if service is available
   */
  abstract checkSearchServiceStatus(): Promise<boolean>;

  /**
   * Update search index
   * @param path Optional specified path
   * @returns Promise indicating operation success
   */
  abstract updateSearchIndex(path?: string): Promise<boolean>;
}
