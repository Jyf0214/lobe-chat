// @vitest-environment node
import { type LobeChatDatabase } from '@lobechat/database';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AsyncTaskModel } from '@/database/models/asyncTask';
import { FileModel } from '@/database/models/file';
import { type ChunkContentParams, ContentChunk } from '@/server/modules/ContentChunk';
import { createAsyncCaller } from '@/server/routers/async';
import { AsyncTaskError, AsyncTaskStatus, AsyncTaskType } from '@/types/asyncTask';

import { ChunkService } from './index';

// Mock dependencies
vi.mock('@/database/models/asyncTask');
vi.mock('@/database/models/file');
vi.mock('@/server/modules/ContentChunk');
vi.mock('@/server/routers/async');

describe('ChunkService', () => {
  let service: ChunkService;
  let mockDb: LobeChatDatabase;
  let mockFileModel: any;
  let mockAsyncTaskModel: any;
  let mockChunkClient: any;
  let mockAsyncCaller: any;

  const userId = 'test-user-123';
  const fileId = 'file-456';
  const asyncTaskId = 'task-789';

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock FileModel
    mockFileModel = {
      findById: vi.fn(),
      update: vi.fn(),
    };
    vi.mocked(FileModel).mockImplementation(() => mockFileModel);

    // Mock AsyncTaskModel
    mockAsyncTaskModel = {
      create: vi.fn(),
      update: vi.fn(),
    };
    vi.mocked(AsyncTaskModel).mockImplementation(() => mockAsyncTaskModel);

    // Mock ContentChunk
    mockChunkClient = {
      chunkContent: vi.fn(),
    };
    vi.mocked(ContentChunk).mockImplementation(() => mockChunkClient);

    // Mock createAsyncCaller
    mockAsyncCaller = {
      file: {
        embeddingChunks: vi.fn(),
        parseFileToChunks: vi.fn(),
      },
    };
    vi.mocked(createAsyncCaller).mockResolvedValue(mockAsyncCaller);

    mockDb = {} as LobeChatDatabase;
    service = new ChunkService(mockDb, userId);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize service with correct dependencies', () => {
      const newService = new ChunkService(mockDb, userId);

      expect(FileModel).toHaveBeenCalledWith(mockDb, userId);
      expect(AsyncTaskModel).toHaveBeenCalledWith(mockDb, userId);
      expect(ContentChunk).toHaveBeenCalled();
      expect(newService).toBeInstanceOf(ChunkService);
    });
  });

  describe('chunkContent', () => {
    it('should delegate to chunkClient.chunkContent', async () => {
      const params: ChunkContentParams = {
        buffer: Buffer.from('test content'),
        filename: 'test.pdf',
        filetype: 'application/pdf',
      };

      const expectedResult = {
        chunks: [{ content: 'chunk 1' }, { content: 'chunk 2' }],
        metadata: { pageCount: 2 },
      };

      mockChunkClient.chunkContent.mockResolvedValueOnce(expectedResult);

      const result = await service.chunkContent(params);

      expect(mockChunkClient.chunkContent).toHaveBeenCalledWith(params);
      expect(result).toEqual(expectedResult);
    });

    it('should handle chunkContent errors', async () => {
      const params: ChunkContentParams = {
        buffer: Buffer.from('invalid content'),
        filename: 'bad.pdf',
        filetype: 'application/pdf',
      };

      const error = new Error('Chunking failed');
      mockChunkClient.chunkContent.mockRejectedValueOnce(error);

      await expect(service.chunkContent(params)).rejects.toThrow('Chunking failed');
      expect(mockChunkClient.chunkContent).toHaveBeenCalledWith(params);
    });
  });

  describe('asyncEmbeddingFileChunks', () => {
    it('should create async task and trigger embedding when file exists', async () => {
      const mockFile = {
        id: fileId,
        name: 'test-doc.pdf',
        url: 'https://example.com/file.pdf',
      };

      mockFileModel.findById.mockResolvedValueOnce(mockFile);
      mockAsyncTaskModel.create.mockResolvedValueOnce(asyncTaskId);
      mockFileModel.update.mockResolvedValueOnce(undefined);
      mockAsyncCaller.file.embeddingChunks.mockResolvedValueOnce(undefined);

      const result = await service.asyncEmbeddingFileChunks(fileId);

      // Verify file lookup
      expect(mockFileModel.findById).toHaveBeenCalledWith(fileId);

      // Verify async task creation
      expect(mockAsyncTaskModel.create).toHaveBeenCalledWith({
        status: AsyncTaskStatus.Pending,
        type: AsyncTaskType.Embedding,
      });

      // Verify file update with task ID
      expect(mockFileModel.update).toHaveBeenCalledWith(fileId, {
        embeddingTaskId: asyncTaskId,
      });

      // Verify async caller setup
      expect(createAsyncCaller).toHaveBeenCalledWith({ userId });

      // Verify embedding task triggered
      expect(mockAsyncCaller.file.embeddingChunks).toHaveBeenCalledWith({
        fileId,
        taskId: asyncTaskId,
      });

      expect(result).toBe(asyncTaskId);
    });

    it('should return undefined when file not found', async () => {
      mockFileModel.findById.mockResolvedValueOnce(null);

      const result = await service.asyncEmbeddingFileChunks(fileId);

      expect(mockFileModel.findById).toHaveBeenCalledWith(fileId);
      expect(mockAsyncTaskModel.create).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should handle async caller error and update task status to Error', async () => {
      const mockFile = {
        id: fileId,
        name: 'test-doc.pdf',
      };

      const taskError = new Error('Network error - APP_URL not reachable');

      mockFileModel.findById.mockResolvedValueOnce(mockFile);
      mockAsyncTaskModel.create.mockResolvedValueOnce(asyncTaskId);
      mockFileModel.update.mockResolvedValueOnce(undefined);
      mockAsyncCaller.file.embeddingChunks.mockRejectedValueOnce(taskError);
      mockAsyncTaskModel.update.mockResolvedValueOnce(undefined);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.asyncEmbeddingFileChunks(fileId);

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('[embeddingFileChunks] error:', taskError);

      // Verify task was updated to Error status
      expect(mockAsyncTaskModel.update).toHaveBeenCalledWith(asyncTaskId, {
        error: expect.any(AsyncTaskError),
        status: AsyncTaskStatus.Error,
      });

      // Verify error details
      const updateCall = mockAsyncTaskModel.update.mock.calls[0];
      expect(updateCall[1]).toHaveProperty('error');
      expect(updateCall[1]).toHaveProperty('status', AsyncTaskStatus.Error);
      expect(updateCall[1].error).toHaveProperty('body');
      expect(updateCall[1].error.body.detail).toContain('APP_URL');

      expect(result).toBe(asyncTaskId);

      consoleErrorSpy.mockRestore();
    });

    it('should create task even if async caller throws error', async () => {
      const mockFile = { id: fileId };

      mockFileModel.findById.mockResolvedValueOnce(mockFile);
      mockAsyncTaskModel.create.mockResolvedValueOnce(asyncTaskId);
      mockAsyncCaller.file.embeddingChunks.mockRejectedValueOnce(new Error('Caller failed'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.asyncEmbeddingFileChunks(fileId);

      expect(mockAsyncTaskModel.create).toHaveBeenCalled();
      expect(result).toBe(asyncTaskId);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('asyncParseFileToChunks', () => {
    it('should create async task and trigger parsing when file exists', async () => {
      const mockFile = {
        id: fileId,
        name: 'document.pdf',
        chunkTaskId: null,
      };

      mockFileModel.findById.mockResolvedValueOnce(mockFile);
      mockAsyncTaskModel.create.mockResolvedValueOnce(asyncTaskId);
      mockFileModel.update.mockResolvedValueOnce(undefined);
      mockAsyncCaller.file.parseFileToChunks.mockResolvedValueOnce(undefined);

      const result = await service.asyncParseFileToChunks(fileId);

      // Verify file lookup
      expect(mockFileModel.findById).toHaveBeenCalledWith(fileId);

      // Verify async task creation with Processing status
      expect(mockAsyncTaskModel.create).toHaveBeenCalledWith({
        status: AsyncTaskStatus.Processing,
        type: AsyncTaskType.Chunking,
      });

      // Verify file update with chunk task ID
      expect(mockFileModel.update).toHaveBeenCalledWith(fileId, {
        chunkTaskId: asyncTaskId,
      });

      // Verify async caller setup
      expect(createAsyncCaller).toHaveBeenCalledWith({ userId });

      // Verify parsing task triggered
      expect(mockAsyncCaller.file.parseFileToChunks).toHaveBeenCalledWith({
        fileId,
        taskId: asyncTaskId,
      });

      expect(result).toBe(asyncTaskId);
    });

    it('should return undefined when file not found', async () => {
      mockFileModel.findById.mockResolvedValueOnce(null);

      const result = await service.asyncParseFileToChunks(fileId);

      expect(mockFileModel.findById).toHaveBeenCalledWith(fileId);
      expect(mockAsyncTaskModel.create).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should skip task creation when skipExist=true and chunk task already exists', async () => {
      const mockFile = {
        id: fileId,
        name: 'document.pdf',
        chunkTaskId: 'existing-task-123',
      };

      mockFileModel.findById.mockResolvedValueOnce(mockFile);

      const result = await service.asyncParseFileToChunks(fileId, true);

      expect(mockFileModel.findById).toHaveBeenCalledWith(fileId);
      expect(mockAsyncTaskModel.create).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should create task when skipExist=true but no existing chunk task', async () => {
      const mockFile = {
        id: fileId,
        name: 'document.pdf',
        chunkTaskId: null,
      };

      mockFileModel.findById.mockResolvedValueOnce(mockFile);
      mockAsyncTaskModel.create.mockResolvedValueOnce(asyncTaskId);
      mockFileModel.update.mockResolvedValueOnce(undefined);
      mockAsyncCaller.file.parseFileToChunks.mockResolvedValueOnce(undefined);

      const result = await service.asyncParseFileToChunks(fileId, true);

      expect(mockAsyncTaskModel.create).toHaveBeenCalled();
      expect(result).toBe(asyncTaskId);
    });

    it('should create task when skipExist=false even if chunk task exists', async () => {
      const mockFile = {
        id: fileId,
        name: 'document.pdf',
        chunkTaskId: 'existing-task-999',
      };

      mockFileModel.findById.mockResolvedValueOnce(mockFile);
      mockAsyncTaskModel.create.mockResolvedValueOnce(asyncTaskId);
      mockFileModel.update.mockResolvedValueOnce(undefined);
      mockAsyncCaller.file.parseFileToChunks.mockResolvedValueOnce(undefined);

      const result = await service.asyncParseFileToChunks(fileId, false);

      expect(mockAsyncTaskModel.create).toHaveBeenCalled();
      expect(mockFileModel.update).toHaveBeenCalledWith(fileId, {
        chunkTaskId: asyncTaskId,
      });
      expect(result).toBe(asyncTaskId);
    });

    it('should handle async caller error via catch handler and update task status', async () => {
      const mockFile = { id: fileId, chunkTaskId: null };
      const taskError = new Error('Parsing service unavailable');

      mockFileModel.findById.mockResolvedValueOnce(mockFile);
      mockAsyncTaskModel.create.mockResolvedValueOnce(asyncTaskId);
      mockFileModel.update.mockResolvedValueOnce(undefined);

      // Create a rejected promise that can be caught
      const rejectedPromise = Promise.reject(taskError);
      mockAsyncCaller.file.parseFileToChunks.mockReturnValueOnce(rejectedPromise);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.asyncParseFileToChunks(fileId);

      // Wait for the catch handler to execute
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ParseFileToChunks] error:', taskError);

      // Verify task was updated to Error status
      expect(mockAsyncTaskModel.update).toHaveBeenCalledWith(asyncTaskId, {
        error: expect.any(AsyncTaskError),
        status: AsyncTaskStatus.Error,
      });

      // Verify error details
      const updateCall = mockAsyncTaskModel.update.mock.calls.find(
        (call) => call[0] === asyncTaskId && call[1].status === AsyncTaskStatus.Error,
      );
      expect(updateCall).toBeDefined();
      expect(updateCall![1]).toHaveProperty('error');
      expect(updateCall![1]).toHaveProperty('status', AsyncTaskStatus.Error);
      expect(updateCall![1].error).toHaveProperty('body');
      expect(updateCall![1].error.body.detail).toContain('APP_URL');

      expect(result).toBe(asyncTaskId);

      consoleErrorSpy.mockRestore();
    });

    it('should return task ID immediately without waiting for async caller to complete', async () => {
      const mockFile = { id: fileId, chunkTaskId: null };

      mockFileModel.findById.mockResolvedValueOnce(mockFile);
      mockAsyncTaskModel.create.mockResolvedValueOnce(asyncTaskId);
      mockFileModel.update.mockResolvedValueOnce(undefined);

      // Make async caller hang to verify method doesn't wait
      const neverResolve = new Promise(() => {});
      mockAsyncCaller.file.parseFileToChunks.mockReturnValueOnce(neverResolve);

      const result = await service.asyncParseFileToChunks(fileId);

      // Should return immediately without waiting for parseFileToChunks to resolve
      expect(result).toBe(asyncTaskId);
    });
  });

  describe('Edge cases', () => {
    it('should handle file model findById returning undefined', async () => {
      mockFileModel.findById.mockResolvedValueOnce(undefined);

      const result = await service.asyncEmbeddingFileChunks(fileId);

      expect(result).toBeUndefined();
      expect(mockAsyncTaskModel.create).not.toHaveBeenCalled();
    });

    it('should handle async task creation failure', async () => {
      const mockFile = { id: fileId };

      mockFileModel.findById.mockResolvedValueOnce(mockFile);
      mockAsyncTaskModel.create.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.asyncEmbeddingFileChunks(fileId)).rejects.toThrow('Database error');
    });

    it('should handle file update failure', async () => {
      const mockFile = { id: fileId };

      mockFileModel.findById.mockResolvedValueOnce(mockFile);
      mockAsyncTaskModel.create.mockResolvedValueOnce(asyncTaskId);
      mockFileModel.update.mockRejectedValueOnce(new Error('Update failed'));

      await expect(service.asyncEmbeddingFileChunks(fileId)).rejects.toThrow('Update failed');
    });
  });
});
