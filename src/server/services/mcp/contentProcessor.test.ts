import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type AudioContent, type ImageContent, type ToolCallContent } from '@/libs/mcp';
import { type FileService } from '@/server/services/file';

import { contentBlocksToString, processContentBlocks } from './contentProcessor';

// Mock environment variables
vi.mock('@/envs/app', () => ({
  appEnv: {
    APP_URL: 'https://example.com',
  },
}));

vi.mock('@/envs/file', () => ({
  fileEnv: {
    NEXT_PUBLIC_S3_FILE_PATH: 's3-files',
  },
}));

describe('contentProcessor', () => {
  describe('processContentBlocks', () => {
    let mockFileService: FileService;

    beforeEach(() => {
      vi.clearAllMocks();

      // Create mock FileService
      mockFileService = {
        uploadBase64: vi.fn(),
      } as any;
    });

    it('should process image blocks and upload to storage', async () => {
      const mockImageUrl = '/api/files/proxy/mcp-images/test-image.png';
      (mockFileService.uploadBase64 as any).mockResolvedValue({
        url: mockImageUrl,
        fileId: 'test-file-id',
        key: 'mcp/images/2026-02-14/test-id.png',
      });

      const imageBlock: ImageContent = {
        type: 'image',
        data: 'base64-encoded-image-data',
        mimeType: 'image/png',
      };

      const blocks: ToolCallContent[] = [imageBlock];

      const result = await processContentBlocks(blocks, mockFileService);

      // Verify uploadBase64 was called with correct parameters
      expect(mockFileService.uploadBase64).toHaveBeenCalledTimes(1);
      expect(mockFileService.uploadBase64).toHaveBeenCalledWith(
        'base64-encoded-image-data',
        expect.stringContaining('mcp/images/'),
      );

      // Verify result contains proxy URL instead of base64 data
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'image',
        data: mockImageUrl,
        mimeType: 'image/png',
      });
    });

    it('should process audio blocks and upload to storage', async () => {
      const mockAudioUrl = '/api/files/proxy/mcp-audio/test-audio.mp3';
      (mockFileService.uploadBase64 as any).mockResolvedValue({
        url: mockAudioUrl,
        fileId: 'test-file-id',
        key: 'mcp/audio/2026-02-14/test-id.mp3',
      });

      const audioBlock: AudioContent = {
        type: 'audio',
        data: 'base64-encoded-audio-data',
        mimeType: 'audio/mp3',
      };

      const blocks: ToolCallContent[] = [audioBlock];

      const result = await processContentBlocks(blocks, mockFileService);

      // Verify uploadBase64 was called
      expect(mockFileService.uploadBase64).toHaveBeenCalledTimes(1);
      expect(mockFileService.uploadBase64).toHaveBeenCalledWith(
        'base64-encoded-audio-data',
        expect.stringContaining('mcp/audio/'),
      );

      // Verify result
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'audio',
        data: mockAudioUrl,
        mimeType: 'audio/mp3',
      });
    });

    it('should handle different image mime types correctly', async () => {
      (mockFileService.uploadBase64 as any).mockResolvedValue({
        url: '/proxy/url',
        fileId: 'id',
        key: 'key',
      });

      const jpegBlock: ImageContent = {
        type: 'image',
        data: 'data',
        mimeType: 'image/jpeg',
      };

      const result = await processContentBlocks([jpegBlock], mockFileService);

      expect(mockFileService.uploadBase64).toHaveBeenCalledWith(
        'data',
        expect.stringMatching(/\.jpeg$/),
      );
    });

    it('should handle different audio mime types correctly', async () => {
      (mockFileService.uploadBase64 as any).mockResolvedValue({
        url: '/proxy/url',
        fileId: 'id',
        key: 'key',
      });

      const wavBlock: AudioContent = {
        type: 'audio',
        data: 'data',
        mimeType: 'audio/wav',
      };

      const result = await processContentBlocks([wavBlock], mockFileService);

      expect(mockFileService.uploadBase64).toHaveBeenCalledWith(
        'data',
        expect.stringMatching(/\.wav$/),
      );
    });

    it('should use default extension when mime type is missing file extension', async () => {
      (mockFileService.uploadBase64 as any).mockResolvedValue({
        url: '/proxy/url',
        fileId: 'id',
        key: 'key',
      });

      const imageBlock: ImageContent = {
        type: 'image',
        data: 'data',
        mimeType: 'image',
      };

      await processContentBlocks([imageBlock], mockFileService);

      // Should default to .png for images
      expect(mockFileService.uploadBase64).toHaveBeenCalledWith(
        'data',
        expect.stringMatching(/\.png$/),
      );
    });

    it('should keep text blocks unchanged', async () => {
      const textBlock: ToolCallContent = {
        type: 'text',
        text: 'Hello World',
      };

      const blocks: ToolCallContent[] = [textBlock];

      const result = await processContentBlocks(blocks, mockFileService);

      expect(mockFileService.uploadBase64).not.toHaveBeenCalled();
      expect(result).toEqual([textBlock]);
    });

    it('should keep resource blocks unchanged', async () => {
      const resourceBlock: ToolCallContent = {
        type: 'resource',
        resource: {
          uri: 'file:///test.txt',
          text: 'content',
        },
      };

      const blocks: ToolCallContent[] = [resourceBlock];

      const result = await processContentBlocks(blocks, mockFileService);

      expect(mockFileService.uploadBase64).not.toHaveBeenCalled();
      expect(result).toEqual([resourceBlock]);
    });

    it('should process mixed content blocks correctly', async () => {
      (mockFileService.uploadBase64 as any).mockResolvedValue({
        url: '/proxy/url',
        fileId: 'id',
        key: 'key',
      });

      const blocks: ToolCallContent[] = [
        { type: 'text', text: 'Hello' },
        { type: 'image', data: 'img-data', mimeType: 'image/png' },
        { type: 'text', text: 'World' },
        { type: 'audio', data: 'audio-data', mimeType: 'audio/mp3' },
      ];

      const result = await processContentBlocks(blocks, mockFileService);

      expect(mockFileService.uploadBase64).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({ type: 'text', text: 'Hello' });
      expect(result[1].type).toBe('image');
      expect(result[2]).toEqual({ type: 'text', text: 'World' });
      expect(result[3].type).toBe('audio');
    });

    it('should handle empty array', async () => {
      const result = await processContentBlocks([], mockFileService);

      expect(mockFileService.uploadBase64).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should generate date-based pathname for privacy compliance', async () => {
      (mockFileService.uploadBase64 as any).mockResolvedValue({
        url: '/proxy/url',
        fileId: 'id',
        key: 'key',
      });

      const imageBlock: ImageContent = {
        type: 'image',
        data: 'data',
        mimeType: 'image/png',
      };

      await processContentBlocks([imageBlock], mockFileService);

      const today = new Date().toISOString().split('T')[0];
      expect(mockFileService.uploadBase64).toHaveBeenCalledWith(
        'data',
        expect.stringContaining(`/mcp/images/${today}/`),
      );
    });
  });

  describe('contentBlocksToString', () => {
    it('should return empty string for null input', () => {
      const result = contentBlocksToString(null);
      expect(result).toBe('');
    });

    it('should return empty string for undefined input', () => {
      const result = contentBlocksToString(undefined);
      expect(result).toBe('');
    });

    it('should return empty string for empty array', () => {
      const result = contentBlocksToString([]);
      expect(result).toBe('');
    });

    it('should convert text content to string', () => {
      const blocks: ToolCallContent[] = [
        { type: 'text', text: 'Hello World' },
        { type: 'text', text: 'Second line' },
      ];

      const result = contentBlocksToString(blocks);

      expect(result).toBe('Hello World\n\nSecond line');
    });

    it('should convert image content to markdown image', () => {
      const blocks: ToolCallContent[] = [
        { type: 'image', data: '/path/to/image.png', mimeType: 'image/png' },
      ];

      const result = contentBlocksToString(blocks);

      expect(result).toBe('![](https://example.com/path/to/image.png)');
    });

    it('should convert audio content to resource tag', () => {
      const blocks: ToolCallContent[] = [
        { type: 'audio', data: '/path/to/audio.mp3', mimeType: 'audio/mp3' },
      ];

      const result = contentBlocksToString(blocks);

      expect(result).toBe('<resource type="audio" url="https://example.com/path/to/audio.mp3" />');
    });

    it('should convert resource content to resource tag with JSON', () => {
      const blocks: ToolCallContent[] = [
        {
          type: 'resource',
          resource: {
            uri: 'file:///test.txt',
            text: 'content',
          },
        },
      ];

      const result = contentBlocksToString(blocks);

      expect(result).toContain('<resource type="resource">');
      expect(result).toContain('"uri":"file:///test.txt"');
      expect(result).toContain('"text":"content"');
    });

    it('should filter out unknown content types', () => {
      const blocks: ToolCallContent[] = [
        { type: 'text', text: 'Valid' },
        { type: 'resource_link', uri: 'https://example.com', name: 'Link' } as any,
        { type: 'text', text: 'Also Valid' },
      ];

      const result = contentBlocksToString(blocks);

      // resource_link should be filtered out (returns empty string)
      expect(result).toBe('Valid\n\nAlso Valid');
    });

    it('should handle mixed content types correctly', () => {
      const blocks: ToolCallContent[] = [
        { type: 'text', text: 'Introduction' },
        { type: 'image', data: '/img.png', mimeType: 'image/png' },
        { type: 'text', text: 'Explanation' },
        { type: 'audio', data: '/audio.mp3', mimeType: 'audio/mp3' },
      ];

      const result = contentBlocksToString(blocks);

      const expected = [
        'Introduction',
        '![](https://example.com/img.png)',
        'Explanation',
        '<resource type="audio" url="https://example.com/audio.mp3" />',
      ].join('\n\n');

      expect(result).toBe(expected);
    });

    it('should join APP_URL with absolute URLs in data field', () => {
      const blocks: ToolCallContent[] = [
        { type: 'image', data: 'https://cdn.example.com/image.png', mimeType: 'image/png' },
      ];

      const result = contentBlocksToString(blocks);

      // urlJoin concatenates URLs even if data contains absolute URL
      expect(result).toBe('![](https://example.com/https://cdn.example.com/image.png)');
    });

    it('should handle relative paths in data field', () => {
      const blocks: ToolCallContent[] = [
        { type: 'image', data: 'images/test.png', mimeType: 'image/png' },
      ];

      const result = contentBlocksToString(blocks);

      expect(result).toBe('![](https://example.com/images/test.png)');
    });

    it('should preserve _meta field in content blocks', () => {
      const blocks: ToolCallContent[] = [
        {
          type: 'text',
          text: 'Text with meta',
          _meta: { id: 'test-123' },
        },
      ];

      const result = contentBlocksToString(blocks);

      expect(result).toBe('Text with meta');
    });

    it('should handle resource with blob data', () => {
      const blocks: ToolCallContent[] = [
        {
          type: 'resource',
          resource: {
            uri: 'file:///data.bin',
            blob: 'base64-data',
            mimeType: 'application/octet-stream',
          },
        },
      ];

      const result = contentBlocksToString(blocks);

      expect(result).toContain('"blob":"base64-data"');
      expect(result).toContain('"mimeType":"application/octet-stream"');
    });
  });
});
