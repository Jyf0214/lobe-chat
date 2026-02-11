import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import the mocked client
import { toolsClient } from '@/libs/trpc/client';
import type {
  CallCodeInterpreterToolInput,
  CallToolResult,
  ExportAndUploadFileInput,
  ExportAndUploadFileResult,
} from '@/server/routers/tools/market';

import { cloudSandboxService } from './cloudSandbox';

// Mock the TRPC client
vi.mock('@/libs/trpc/client', () => ({
  toolsClient: {
    market: {
      callCodeInterpreterTool: {
        mutate: vi.fn(),
      },
      exportAndUploadFile: {
        mutate: vi.fn(),
      },
    },
  },
}));

describe('CloudSandboxService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('callTool', () => {
    it('should call a tool successfully with correct parameters', async () => {
      const mockResult: CallToolResult = {
        result: { output: 'test output' },
        success: true,
      };

      vi.mocked(toolsClient.market.callCodeInterpreterTool.mutate).mockResolvedValue(mockResult);

      const toolName = 'runCommand';
      const params = { command: 'ls -la' };
      const context = { userId: 'user-123', topicId: 'topic-456' };

      const result = await cloudSandboxService.callTool(toolName, params, context);

      expect(result).toEqual(mockResult);
      expect(toolsClient.market.callCodeInterpreterTool.mutate).toHaveBeenCalledTimes(1);

      const expectedInput: CallCodeInterpreterToolInput = {
        toolName,
        params,
        userId: context.userId,
        topicId: context.topicId,
      };
      expect(toolsClient.market.callCodeInterpreterTool.mutate).toHaveBeenCalledWith(expectedInput);
    });

    it('should handle tool call with empty parameters', async () => {
      const mockResult: CallToolResult = {
        result: {},
        success: true,
      };

      vi.mocked(toolsClient.market.callCodeInterpreterTool.mutate).mockResolvedValue(mockResult);

      const result = await cloudSandboxService.callTool(
        'getTopic',
        {},
        {
          userId: 'user-1',
          topicId: 'topic-1',
        },
      );

      expect(result).toEqual(mockResult);
      expect(toolsClient.market.callCodeInterpreterTool.mutate).toHaveBeenCalledWith({
        toolName: 'getTopic',
        params: {},
        userId: 'user-1',
        topicId: 'topic-1',
      });
    });

    it('should handle tool call with complex nested parameters', async () => {
      const mockResult: CallToolResult = {
        result: { fileId: 'file-123' },
        success: true,
      };

      vi.mocked(toolsClient.market.callCodeInterpreterTool.mutate).mockResolvedValue(mockResult);

      const complexParams = {
        files: [
          { path: '/tmp/file1.txt', content: 'data1' },
          { path: '/tmp/file2.txt', content: 'data2' },
        ],
        options: {
          recursive: true,
          overwrite: false,
        },
      };

      const result = await cloudSandboxService.callTool('writeMultipleFiles', complexParams, {
        userId: 'user-xyz',
        topicId: 'topic-abc',
      });

      expect(result).toEqual(mockResult);
      expect(toolsClient.market.callCodeInterpreterTool.mutate).toHaveBeenCalledWith({
        toolName: 'writeMultipleFiles',
        params: complexParams,
        userId: 'user-xyz',
        topicId: 'topic-abc',
      });
    });

    it('should handle error responses from tool call', async () => {
      const mockErrorResult: CallToolResult = {
        result: null,
        success: false,
        error: {
          name: 'ToolExecutionError',
          message: 'Failed to execute command',
        },
      };

      vi.mocked(toolsClient.market.callCodeInterpreterTool.mutate).mockResolvedValue(
        mockErrorResult,
      );

      const result = await cloudSandboxService.callTool(
        'runCommand',
        { command: 'invalid' },
        {
          userId: 'user-1',
          topicId: 'topic-1',
        },
      );

      expect(result).toEqual(mockErrorResult);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Failed to execute command');
    });

    it('should propagate network errors from TRPC client', async () => {
      const networkError = new Error('Network timeout');

      vi.mocked(toolsClient.market.callCodeInterpreterTool.mutate).mockRejectedValue(networkError);

      await expect(
        cloudSandboxService.callTool(
          'runCommand',
          { command: 'ls' },
          {
            userId: 'user-1',
            topicId: 'topic-1',
          },
        ),
      ).rejects.toThrow('Network timeout');
    });

    it('should handle session recreation flag', async () => {
      const mockResult: CallToolResult = {
        result: { output: 'reconnected' },
        success: true,
        sessionExpiredAndRecreated: true,
      };

      vi.mocked(toolsClient.market.callCodeInterpreterTool.mutate).mockResolvedValue(mockResult);

      const result = await cloudSandboxService.callTool(
        'runCommand',
        { command: 'pwd' },
        {
          userId: 'user-1',
          topicId: 'topic-1',
        },
      );

      expect(result.sessionExpiredAndRecreated).toBe(true);
    });
  });

  describe('exportAndUploadFile', () => {
    it('should export and upload file successfully', async () => {
      const mockResult: ExportAndUploadFileResult = {
        success: true,
        fileId: 'file-abc-123',
        filename: 'output.txt',
        url: '/f/file-abc-123',
        size: 1024,
        mimeType: 'text/plain',
      };

      vi.mocked(toolsClient.market.exportAndUploadFile.mutate).mockResolvedValue(mockResult);

      const path = '/sandbox/output/result.txt';
      const filename = 'output.txt';
      const topicId = 'topic-789';

      const result = await cloudSandboxService.exportAndUploadFile(path, filename, topicId);

      expect(result).toEqual(mockResult);
      expect(toolsClient.market.exportAndUploadFile.mutate).toHaveBeenCalledTimes(1);

      const expectedInput: ExportAndUploadFileInput = {
        path,
        filename,
        topicId,
      };
      expect(toolsClient.market.exportAndUploadFile.mutate).toHaveBeenCalledWith(expectedInput);
    });

    it('should handle export of different file types', async () => {
      const testCases = [
        {
          filename: 'data.json',
          mimeType: 'application/json',
          size: 2048,
        },
        {
          filename: 'image.png',
          mimeType: 'image/png',
          size: 51200,
        },
        {
          filename: 'document.pdf',
          mimeType: 'application/pdf',
          size: 102400,
        },
      ];

      for (const testCase of testCases) {
        const mockResult: ExportAndUploadFileResult = {
          success: true,
          fileId: `file-${testCase.filename}`,
          filename: testCase.filename,
          url: `/f/file-${testCase.filename}`,
          size: testCase.size,
          mimeType: testCase.mimeType,
        };

        vi.mocked(toolsClient.market.exportAndUploadFile.mutate).mockResolvedValue(mockResult);

        const result = await cloudSandboxService.exportAndUploadFile(
          `/sandbox/${testCase.filename}`,
          testCase.filename,
          'topic-1',
        );

        expect(result.filename).toBe(testCase.filename);
        expect(result.mimeType).toBe(testCase.mimeType);
        expect(result.size).toBe(testCase.size);
      }
    });

    it('should handle file export errors', async () => {
      const mockErrorResult: ExportAndUploadFileResult = {
        success: false,
        filename: 'missing.txt',
        error: {
          message: 'File not found in sandbox',
        },
      };

      vi.mocked(toolsClient.market.exportAndUploadFile.mutate).mockResolvedValue(mockErrorResult);

      const result = await cloudSandboxService.exportAndUploadFile(
        '/nonexistent/path.txt',
        'missing.txt',
        'topic-1',
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('File not found in sandbox');
      expect(result.fileId).toBeUndefined();
      expect(result.url).toBeUndefined();
    });

    it('should handle upload failures', async () => {
      const uploadError = new Error('S3 upload failed');

      vi.mocked(toolsClient.market.exportAndUploadFile.mutate).mockRejectedValue(uploadError);

      await expect(
        cloudSandboxService.exportAndUploadFile('/sandbox/file.txt', 'file.txt', 'topic-1'),
      ).rejects.toThrow('S3 upload failed');
    });

    it('should handle files with special characters in filename', async () => {
      const specialFilename = 'my file (copy) [1].txt';
      const mockResult: ExportAndUploadFileResult = {
        success: true,
        fileId: 'file-special',
        filename: specialFilename,
        url: '/f/file-special',
        size: 512,
        mimeType: 'text/plain',
      };

      vi.mocked(toolsClient.market.exportAndUploadFile.mutate).mockResolvedValue(mockResult);

      const result = await cloudSandboxService.exportAndUploadFile(
        '/sandbox/special.txt',
        specialFilename,
        'topic-1',
      );

      expect(result.filename).toBe(specialFilename);
      expect(result.success).toBe(true);
    });

    it('should handle large file exports', async () => {
      const mockResult: ExportAndUploadFileResult = {
        success: true,
        fileId: 'file-large',
        filename: 'large-dataset.csv',
        url: '/f/file-large',
        size: 10485760, // 10MB
        mimeType: 'text/csv',
      };

      vi.mocked(toolsClient.market.exportAndUploadFile.mutate).mockResolvedValue(mockResult);

      const result = await cloudSandboxService.exportAndUploadFile(
        '/sandbox/data/large.csv',
        'large-dataset.csv',
        'topic-1',
      );

      expect(result.size).toBe(10485760);
      expect(result.success).toBe(true);
    });
  });

  describe('context isolation', () => {
    it('should isolate calls by userId and topicId', async () => {
      const mockResult: CallToolResult = {
        result: { data: 'isolated' },
        success: true,
      };

      vi.mocked(toolsClient.market.callCodeInterpreterTool.mutate).mockResolvedValue(mockResult);

      // Call with different user/topic combinations
      await cloudSandboxService.callTool(
        'getTopic',
        {},
        {
          userId: 'user-A',
          topicId: 'topic-1',
        },
      );
      await cloudSandboxService.callTool(
        'getTopic',
        {},
        {
          userId: 'user-B',
          topicId: 'topic-1',
        },
      );
      await cloudSandboxService.callTool(
        'getTopic',
        {},
        {
          userId: 'user-A',
          topicId: 'topic-2',
        },
      );

      expect(toolsClient.market.callCodeInterpreterTool.mutate).toHaveBeenCalledTimes(3);

      const calls = vi.mocked(toolsClient.market.callCodeInterpreterTool.mutate).mock.calls;
      expect(calls[0][0]).toMatchObject({ userId: 'user-A', topicId: 'topic-1' });
      expect(calls[1][0]).toMatchObject({ userId: 'user-B', topicId: 'topic-1' });
      expect(calls[2][0]).toMatchObject({ userId: 'user-A', topicId: 'topic-2' });
    });
  });
});
