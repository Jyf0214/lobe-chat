import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type AudioContent, type ImageContent, type ToolCallContent } from '@/libs/mcp';
import { type FileService } from '@/server/services/file';

import { contentBlocksToString, processContentBlocks } from './contentProcessor';

// Mock dependencies
vi.mock('@/envs/app', () => ({
  appEnv: {
    APP_URL: 'https://example.com',
  },
}));

vi.mock('@/envs/file', () => ({
  fileEnv: {
    NEXT_PUBLIC_S3_FILE_PATH: '/files',
  },
}));

vi.mock('@/utils/uuid', () => ({
  nanoid: vi.fn(() => 'test-uuid-123'),
}));

describe('contentProcessor', () => {
  describe('processContentBlocks', () => {
    let mockFileService: FileService;
    let mockUploadBase64: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      vi.clearAllMocks();
      mockUploadBase64 = vi.fn();
      mockFileService = {
        uploadBase64: mockUploadBase64,
      } as any;

      // Mock Date to return a fixed date for consistent tests
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-11-08T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should process empty array', async () => {
      const blocks: ToolCallContent[] = [];
      const result = await processContentBlocks(blocks, mockFileService);

      expect(result).toEqual([]);
      expect(mockUploadBase64).not.toHaveBeenCalled();
    });

    it('should process image block and upload to storage', async () => {
      const imageBlock: ImageContent = {
        type: 'image',
        data: 'base64-image-data',
        mimeType: 'image/png',
      };

      mockUploadBase64.mockResolvedValue({
        url: 'https://cdn.example.com/image.png',
      });

      const result = await processContentBlocks([imageBlock], mockFileService);

      expect(mockUploadBase64).toHaveBeenCalledWith(
        'base64-image-data',
        '/files/mcp/images/2025-11-08/test-uuid-123.png',
      );
      expect(result).toEqual([
        {
          type: 'image',
          data: 'https://cdn.example.com/image.png',
          mimeType: 'image/png',
        },
      ]);
    });

    it('should process audio block and upload to storage', async () => {
      const audioBlock: AudioContent = {
        type: 'audio',
        data: 'base64-audio-data',
        mimeType: 'audio/mp3',
      };

      mockUploadBase64.mockResolvedValue({
        url: 'https://cdn.example.com/audio.mp3',
      });

      const result = await processContentBlocks([audioBlock], mockFileService);

      expect(mockUploadBase64).toHaveBeenCalledWith(
        'base64-audio-data',
        '/files/mcp/audio/2025-11-08/test-uuid-123.mp3',
      );
      expect(result).toEqual([
        {
          type: 'audio',
          data: 'https://cdn.example.com/audio.mp3',
          mimeType: 'audio/mp3',
        },
      ]);
    });

    it('should keep text blocks unchanged', async () => {
      const textBlock: ToolCallContent = {
        type: 'text',
        text: 'Hello World',
      };

      const result = await processContentBlocks([textBlock], mockFileService);

      expect(mockUploadBase64).not.toHaveBeenCalled();
      expect(result).toEqual([textBlock]);
    });

    it('should keep resource blocks unchanged', async () => {
      const resourceBlock: ToolCallContent = {
        type: 'resource',
        resource: {
          uri: 'file:///path/to/resource',
          text: 'Resource content',
        },
      };

      const result = await processContentBlocks([resourceBlock], mockFileService);

      expect(mockUploadBase64).not.toHaveBeenCalled();
      expect(result).toEqual([resourceBlock]);
    });

    it('should keep resource_link blocks unchanged', async () => {
      const resourceLinkBlock: ToolCallContent = {
        type: 'resource_link',
        uri: 'https://example.com/resource',
        name: 'Test Resource',
      };

      const result = await processContentBlocks([resourceLinkBlock], mockFileService);

      expect(mockUploadBase64).not.toHaveBeenCalled();
      expect(result).toEqual([resourceLinkBlock]);
    });

    it('should process multiple blocks in parallel', async () => {
      const blocks: ToolCallContent[] = [
        { type: 'text', text: 'Text 1' },
        { type: 'image', data: 'image-data-1', mimeType: 'image/jpeg' },
        { type: 'text', text: 'Text 2' },
        { type: 'audio', data: 'audio-data-1', mimeType: 'audio/wav' },
      ];

      mockUploadBase64
        .mockResolvedValueOnce({ url: 'https://cdn.example.com/image1.jpeg' })
        .mockResolvedValueOnce({ url: 'https://cdn.example.com/audio1.wav' });

      const result = await processContentBlocks(blocks, mockFileService);

      expect(mockUploadBase64).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({ type: 'text', text: 'Text 1' });
      expect(result[1]).toEqual({
        type: 'image',
        data: 'https://cdn.example.com/image1.jpeg',
        mimeType: 'image/jpeg',
      });
      expect(result[2]).toEqual({ type: 'text', text: 'Text 2' });
      expect(result[3]).toEqual({
        type: 'audio',
        data: 'https://cdn.example.com/audio1.wav',
        mimeType: 'audio/wav',
      });
    });

    it('should extract file extension from image mimeType', async () => {
      const imageBlock: ImageContent = {
        type: 'image',
        data: 'base64-data',
        mimeType: 'image/webp',
      };

      mockUploadBase64.mockResolvedValue({ url: 'https://cdn.example.com/image.webp' });

      await processContentBlocks([imageBlock], mockFileService);

      expect(mockUploadBase64).toHaveBeenCalledWith(
        'base64-data',
        '/files/mcp/images/2025-11-08/test-uuid-123.webp',
      );
    });

    it('should extract file extension from audio mimeType', async () => {
      const audioBlock: AudioContent = {
        type: 'audio',
        data: 'base64-data',
        mimeType: 'audio/ogg',
      };

      mockUploadBase64.mockResolvedValue({ url: 'https://cdn.example.com/audio.ogg' });

      await processContentBlocks([audioBlock], mockFileService);

      expect(mockUploadBase64).toHaveBeenCalledWith(
        'base64-data',
        '/files/mcp/audio/2025-11-08/test-uuid-123.ogg',
      );
    });

    it('should use default extension for image when mimeType has no extension', async () => {
      const imageBlock: ImageContent = {
        type: 'image',
        data: 'base64-data',
        mimeType: 'image/',
      };

      mockUploadBase64.mockResolvedValue({ url: 'https://cdn.example.com/image.png' });

      await processContentBlocks([imageBlock], mockFileService);

      expect(mockUploadBase64).toHaveBeenCalledWith(
        'base64-data',
        '/files/mcp/images/2025-11-08/test-uuid-123.png',
      );
    });

    it('should use default extension for audio when mimeType has no extension', async () => {
      const audioBlock: AudioContent = {
        type: 'audio',
        data: 'base64-data',
        mimeType: 'audio/',
      };

      mockUploadBase64.mockResolvedValue({ url: 'https://cdn.example.com/audio.mp3' });

      await processContentBlocks([audioBlock], mockFileService);

      expect(mockUploadBase64).toHaveBeenCalledWith(
        'base64-data',
        '/files/mcp/audio/2025-11-08/test-uuid-123.mp3',
      );
    });

    it('should use date-based sharding for pathname', async () => {
      vi.setSystemTime(new Date('2026-02-07T10:30:00Z'));

      const imageBlock: ImageContent = {
        type: 'image',
        data: 'base64-data',
        mimeType: 'image/png',
      };

      mockUploadBase64.mockResolvedValue({ url: 'https://cdn.example.com/image.png' });

      await processContentBlocks([imageBlock], mockFileService);

      expect(mockUploadBase64).toHaveBeenCalledWith(
        'base64-data',
        '/files/mcp/images/2026-02-07/test-uuid-123.png',
      );
    });

    it('should preserve metadata in image blocks', async () => {
      const imageBlock: ImageContent = {
        type: 'image',
        data: 'base64-data',
        mimeType: 'image/png',
        _meta: { source: 'screenshot', timestamp: 123456 },
      };

      mockUploadBase64.mockResolvedValue({ url: 'https://cdn.example.com/image.png' });

      const result = await processContentBlocks([imageBlock], mockFileService);

      expect(result[0]).toEqual({
        type: 'image',
        data: 'https://cdn.example.com/image.png',
        mimeType: 'image/png',
        _meta: { source: 'screenshot', timestamp: 123456 },
      });
    });

    it('should preserve metadata in audio blocks', async () => {
      const audioBlock: AudioContent = {
        type: 'audio',
        data: 'base64-data',
        mimeType: 'audio/mp3',
        _meta: { duration: 120, bitrate: 320 },
      };

      mockUploadBase64.mockResolvedValue({ url: 'https://cdn.example.com/audio.mp3' });

      const result = await processContentBlocks([audioBlock], mockFileService);

      expect(result[0]).toEqual({
        type: 'audio',
        data: 'https://cdn.example.com/audio.mp3',
        mimeType: 'audio/mp3',
        _meta: { duration: 120, bitrate: 320 },
      });
    });

    it('should handle upload errors gracefully', async () => {
      const imageBlock: ImageContent = {
        type: 'image',
        data: 'base64-data',
        mimeType: 'image/png',
      };

      mockUploadBase64.mockRejectedValue(new Error('Upload failed'));

      await expect(processContentBlocks([imageBlock], mockFileService)).rejects.toThrow(
        'Upload failed',
      );
    });

    it('should handle different image formats', async () => {
      const formats = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];

      mockUploadBase64.mockImplementation((data, pathname) => {
        const extension = pathname.split('.').pop();
        return Promise.resolve({ url: `https://cdn.example.com/image.${extension}` });
      });

      for (const mimeType of formats) {
        const imageBlock: ImageContent = {
          type: 'image',
          data: 'base64-data',
          mimeType,
        };

        const result = await processContentBlocks([imageBlock], mockFileService);
        const expectedExtension = mimeType.split('/')[1] || 'png';

        expect(mockUploadBase64).toHaveBeenCalledWith(
          'base64-data',
          expect.stringContaining(`.${expectedExtension}`),
        );
      }
    });

    it('should handle different audio formats', async () => {
      const formats = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg', 'audio/webm'];

      mockUploadBase64.mockImplementation((data, pathname) => {
        const extension = pathname.split('.').pop();
        return Promise.resolve({ url: `https://cdn.example.com/audio.${extension}` });
      });

      for (const mimeType of formats) {
        const audioBlock: AudioContent = {
          type: 'audio',
          data: 'base64-data',
          mimeType,
        };

        await processContentBlocks([audioBlock], mockFileService);
        const expectedExtension = mimeType.split('/')[1] || 'mp3';

        expect(mockUploadBase64).toHaveBeenCalledWith(
          'base64-data',
          expect.stringContaining(`.${expectedExtension}`),
        );
      }
    });
  });

  describe('contentBlocksToString', () => {
    it('should return empty string for null input', () => {
      expect(contentBlocksToString(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(contentBlocksToString(undefined)).toBe('');
    });

    it('should return empty string for empty array', () => {
      expect(contentBlocksToString([])).toBe('');
    });

    it('should convert text block to text', () => {
      const blocks: ToolCallContent[] = [{ type: 'text', text: 'Hello World' }];

      expect(contentBlocksToString(blocks)).toBe('Hello World');
    });

    it('should convert image block to markdown', () => {
      const blocks: ToolCallContent[] = [
        { type: 'image', data: '/path/to/image.png', mimeType: 'image/png' },
      ];

      expect(contentBlocksToString(blocks)).toBe('![](https://example.com/path/to/image.png)');
    });

    it('should convert audio block to resource tag', () => {
      const blocks: ToolCallContent[] = [
        { type: 'audio', data: '/path/to/audio.mp3', mimeType: 'audio/mp3' },
      ];

      expect(contentBlocksToString(blocks)).toBe(
        '<resource type="audio" url="https://example.com/path/to/audio.mp3" />',
      );
    });

    it('should convert resource block to resource tag with JSON', () => {
      const blocks: ToolCallContent[] = [
        {
          type: 'resource',
          resource: {
            uri: 'file:///path/to/file',
            text: 'Content',
          },
        },
      ];

      const result = contentBlocksToString(blocks);

      expect(result).toContain('<resource type="resource">');
      expect(result).toContain('"uri":"file:///path/to/file"');
      expect(result).toContain('"text":"Content"');
    });

    it('should filter out unsupported block types', () => {
      const blocks: ToolCallContent[] = [
        { type: 'resource_link', uri: 'https://example.com', name: 'Link' },
      ];

      expect(contentBlocksToString(blocks)).toBe('');
    });

    it('should join multiple blocks with double newlines', () => {
      const blocks: ToolCallContent[] = [
        { type: 'text', text: 'First' },
        { type: 'text', text: 'Second' },
        { type: 'text', text: 'Third' },
      ];

      expect(contentBlocksToString(blocks)).toBe('First\n\nSecond\n\nThird');
    });

    it('should handle mixed block types', () => {
      const blocks: ToolCallContent[] = [
        { type: 'text', text: 'Hello' },
        { type: 'image', data: '/image.png', mimeType: 'image/png' },
        { type: 'text', text: 'World' },
        { type: 'audio', data: '/audio.mp3', mimeType: 'audio/mp3' },
      ];

      const result = contentBlocksToString(blocks);

      expect(result).toContain('Hello');
      expect(result).toContain('![](https://example.com/image.png)');
      expect(result).toContain('World');
      expect(result).toContain('<resource type="audio" url="https://example.com/audio.mp3" />');
    });

    it('should handle empty text blocks', () => {
      const blocks: ToolCallContent[] = [{ type: 'text', text: '' }];

      expect(contentBlocksToString(blocks)).toBe('');
    });

    it('should join URLs correctly with APP_URL', () => {
      const blocks: ToolCallContent[] = [
        { type: 'image', data: 'images/test.png', mimeType: 'image/png' },
      ];

      expect(contentBlocksToString(blocks)).toBe('![](https://example.com/images/test.png)');
    });

    it('should handle absolute URLs in data field', () => {
      const blocks: ToolCallContent[] = [
        { type: 'image', data: 'https://cdn.example.com/image.png', mimeType: 'image/png' },
      ];

      const result = contentBlocksToString(blocks);

      expect(result).toContain('https://');
    });

    it('should handle multiline text blocks', () => {
      const blocks: ToolCallContent[] = [{ type: 'text', text: 'Line 1\nLine 2\nLine 3' }];

      expect(contentBlocksToString(blocks)).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should preserve special characters in text', () => {
      const blocks: ToolCallContent[] = [{ type: 'text', text: '<script>alert("XSS")</script>' }];

      expect(contentBlocksToString(blocks)).toBe('<script>alert("XSS")</script>');
    });

    it('should handle resource with blob data', () => {
      const blocks: ToolCallContent[] = [
        {
          type: 'resource',
          resource: {
            uri: 'data:text/plain;base64,SGVsbG8=',
            blob: 'base64-blob-data',
            mimeType: 'text/plain',
          },
        },
      ];

      const result = contentBlocksToString(blocks);

      expect(result).toContain('"blob":"base64-blob-data"');
      expect(result).toContain('"mimeType":"text/plain"');
    });

    it('should handle metadata in blocks', () => {
      const blocks: ToolCallContent[] = [
        { type: 'text', text: 'Hello', _meta: { source: 'test' } },
      ];

      expect(contentBlocksToString(blocks)).toBe('Hello');
    });

    it('should filter empty strings after mapping', () => {
      const blocks: ToolCallContent[] = [
        { type: 'text', text: 'Valid' },
        { type: 'resource_link', uri: 'https://example.com', name: 'Link' }, // Returns empty string
        { type: 'text', text: 'Also Valid' },
      ];

      expect(contentBlocksToString(blocks)).toBe('Valid\n\nAlso Valid');
    });
  });
});
