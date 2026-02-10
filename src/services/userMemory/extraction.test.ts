import { beforeEach, describe, expect, it, vi } from 'vitest';

import { lambdaClient } from '@/libs/trpc/client';

import { memoryExtractionService } from './extraction';

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    userMemory: {
      requestMemoryFromChatTopic: { mutate: vi.fn() },
      getMemoryExtractionTask: { query: vi.fn() },
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MemoryExtractionService', () => {
  describe('requestFromChatTopics', () => {
    it('should call lambdaClient with date range params', async () => {
      // Arrange
      const params = {
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-01-31'),
      };
      const mockResult = { id: 'task-123', status: 'processing', deduped: false } as any;
      vi.spyOn(lambdaClient.userMemory.requestMemoryFromChatTopic, 'mutate').mockResolvedValue(
        mockResult,
      );

      // Act
      await memoryExtractionService.requestFromChatTopics(params);

      // Assert
      expect(lambdaClient.userMemory.requestMemoryFromChatTopic.mutate).toHaveBeenCalledWith(
        params,
      );
    });

    it('should call lambdaClient without date params', async () => {
      // Arrange
      const params = {};
      vi.spyOn(lambdaClient.userMemory.requestMemoryFromChatTopic, 'mutate').mockResolvedValue(
        {} as any,
      );

      // Act
      await memoryExtractionService.requestFromChatTopics(params);

      // Assert
      expect(lambdaClient.userMemory.requestMemoryFromChatTopic.mutate).toHaveBeenCalledWith(
        params,
      );
    });

    it('should propagate errors', async () => {
      // Arrange
      const error = new Error('Network error');
      vi.spyOn(lambdaClient.userMemory.requestMemoryFromChatTopic, 'mutate').mockRejectedValue(
        error,
      );

      // Act & Assert
      await expect(memoryExtractionService.requestFromChatTopics({})).rejects.toThrow(
        'Network error',
      );
    });
  });

  describe('getTask', () => {
    it('should call lambdaClient with taskId', async () => {
      // Arrange
      const taskId = 'task-123';
      const mockTask = { id: taskId, status: 'processing' } as any;
      vi.spyOn(lambdaClient.userMemory.getMemoryExtractionTask, 'query').mockResolvedValue(
        mockTask,
      );

      // Act
      await memoryExtractionService.getTask(taskId);

      // Assert
      expect(lambdaClient.userMemory.getMemoryExtractionTask.query).toHaveBeenCalledWith({
        taskId,
      });
    });

    it('should call lambdaClient without taskId', async () => {
      // Arrange
      vi.spyOn(lambdaClient.userMemory.getMemoryExtractionTask, 'query').mockResolvedValue(
        {} as any,
      );

      // Act
      await memoryExtractionService.getTask();

      // Assert
      expect(lambdaClient.userMemory.getMemoryExtractionTask.query).toHaveBeenCalledWith(undefined);
    });

    it('should return null when task not found', async () => {
      // Arrange
      vi.spyOn(lambdaClient.userMemory.getMemoryExtractionTask, 'query').mockResolvedValue(null);

      // Act
      const result = await memoryExtractionService.getTask('non-existent');

      // Assert
      expect(result).toBeNull();
    });

    it('should propagate errors', async () => {
      // Arrange
      const error = new Error('Database error');
      vi.spyOn(lambdaClient.userMemory.getMemoryExtractionTask, 'query').mockRejectedValue(error);

      // Act & Assert
      await expect(memoryExtractionService.getTask('task-123')).rejects.toThrow('Database error');
    });
  });
});
