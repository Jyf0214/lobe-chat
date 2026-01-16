import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MessagesBatcher } from '../batcher';

// Mock the lambdaClient
vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    message: {
      batchOperations: {
        mutate: vi.fn(),
      },
    },
  },
}));

describe('MessagesBatcher', () => {
  let batcher: MessagesBatcher;

  beforeEach(() => {
    vi.clearAllMocks();
    batcher = new MessagesBatcher();
  });

  describe('dispatch', () => {
    it('should add operation to queue', () => {
      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { content: 'hello' },
        type: 'create',
      });

      expect(batcher.getQueueLength()).toBe(1);
    });

    it('should merge create + update operations', () => {
      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { content: 'hello' },
        type: 'create',
      });

      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { content: 'hello world' },
        type: 'update',
      });

      // Should still be 1 operation (merged)
      expect(batcher.getQueueLength()).toBe(1);
    });

    it('should cancel out create + delete operations', () => {
      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { content: 'hello' },
        type: 'create',
      });

      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: {},
        type: 'delete',
      });

      // Should be empty (cancelled out)
      expect(batcher.getQueueLength()).toBe(0);
    });

    it('should merge update + update operations', () => {
      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { content: 'hello' },
        type: 'update',
      });

      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { reasoning: 'thinking...' },
        type: 'update',
      });

      expect(batcher.getQueueLength()).toBe(1);
    });

    it('should replace update with delete', () => {
      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { content: 'hello' },
        type: 'update',
      });

      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: {},
        type: 'delete',
      });

      expect(batcher.getQueueLength()).toBe(1);
    });

    it('should merge updateMetadata operations', () => {
      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { key1: 'value1' },
        type: 'updateMetadata',
      });

      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { key2: 'value2' },
        type: 'updateMetadata',
      });

      expect(batcher.getQueueLength()).toBe(1);
    });

    it('should merge updateToolMessage operations', () => {
      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { pluginState: { step: 1 } },
        type: 'updateToolMessage',
      });

      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { content: 'result' },
        type: 'updateToolMessage',
      });

      expect(batcher.getQueueLength()).toBe(1);
    });

    it('should keep operations for different messages separate', () => {
      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { content: 'hello' },
        type: 'create',
      });

      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-2',
        payload: { content: 'world' },
        type: 'create',
      });

      expect(batcher.getQueueLength()).toBe(2);
    });

    it('should keep operations for different contexts separate', () => {
      batcher.dispatch({
        context: { agentId: 'agent-1', topicId: 'topic-1' },
        messageId: 'msg-1',
        payload: { content: 'hello' },
        type: 'update',
      });

      batcher.dispatch({
        context: { agentId: 'agent-1', topicId: 'topic-2' },
        messageId: 'msg-1',
        payload: { content: 'world' },
        type: 'update',
      });

      // Same messageId but different context, so they should be separate
      expect(batcher.getQueueLength()).toBe(2);
    });
  });

  describe('microtask flush', () => {
    it('should flush via microtask after dispatch', async () => {
      const { lambdaClient } = await import('@/libs/trpc/client');
      vi.mocked(lambdaClient.message.batchOperations.mutate).mockResolvedValue({
        messages: [],
        success: true,
      });

      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { content: 'hello' },
        type: 'create',
      });

      // Not flushed yet (synchronously)
      expect(lambdaClient.message.batchOperations.mutate).not.toHaveBeenCalled();

      // Wait for microtask to complete
      await Promise.resolve();
      await Promise.resolve(); // Extra tick for the flush to complete

      expect(lambdaClient.message.batchOperations.mutate).toHaveBeenCalledTimes(1);
    });

    it('should batch multiple synchronous dispatches into one flush', async () => {
      const { lambdaClient } = await import('@/libs/trpc/client');
      vi.mocked(lambdaClient.message.batchOperations.mutate).mockResolvedValue({
        messages: [],
        success: true,
      });

      // Multiple synchronous dispatches
      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { content: 'hello' },
        type: 'create',
      });

      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-2',
        payload: { content: 'world' },
        type: 'create',
      });

      // Wait for microtask
      await Promise.resolve();
      await Promise.resolve();

      // Should have been called only once with both operations
      expect(lambdaClient.message.batchOperations.mutate).toHaveBeenCalledTimes(1);
      expect(lambdaClient.message.batchOperations.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          operations: expect.arrayContaining([
            expect.objectContaining({ messageId: 'msg-1' }),
            expect.objectContaining({ messageId: 'msg-2' }),
          ]),
        }),
      );
    });

    it('should clear the queue after flush', async () => {
      const { lambdaClient } = await import('@/libs/trpc/client');
      vi.mocked(lambdaClient.message.batchOperations.mutate).mockResolvedValue({
        messages: [],
        success: true,
      });

      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { content: 'hello' },
        type: 'create',
      });

      // Wait for flush
      await Promise.resolve();
      await Promise.resolve();

      expect(batcher.getQueueLength()).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should log error but not re-queue on failure', async () => {
      const { lambdaClient } = await import('@/libs/trpc/client');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(lambdaClient.message.batchOperations.mutate).mockRejectedValue(
        new Error('Network error'),
      );

      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { content: 'hello' },
        type: 'create',
      });

      // Wait for flush
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve(); // Extra tick for error handling

      // Error should be logged
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Queue should be empty (not re-queued - local cache is source of truth)
      expect(batcher.getQueueLength()).toBe(0);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('complex scenarios', () => {
    it('should handle rapid create-update-delete sequence', () => {
      // Simulate rapid user actions
      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { content: 'hello' },
        type: 'create',
      });

      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { content: 'hello world' },
        type: 'update',
      });

      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: {},
        type: 'delete',
      });

      // All should cancel out
      expect(batcher.getQueueLength()).toBe(0);
    });

    it('should handle multiple messages with mixed operations', async () => {
      const { lambdaClient } = await import('@/libs/trpc/client');
      vi.mocked(lambdaClient.message.batchOperations.mutate).mockResolvedValue({
        messages: [],
        success: true,
      });

      // Create msg-1
      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { content: 'hello' },
        type: 'create',
      });

      // Create msg-2
      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-2',
        payload: { content: 'world' },
        type: 'create',
      });

      // Update msg-1
      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-1',
        payload: { content: 'hello updated' },
        type: 'update',
      });

      // Delete msg-2
      batcher.dispatch({
        context: { agentId: 'agent-1' },
        messageId: 'msg-2',
        payload: {},
        type: 'delete',
      });

      // Should have 1 operation (create msg-1 with updated content)
      // msg-2 create + delete should cancel out
      expect(batcher.getQueueLength()).toBe(1);

      // Wait for flush
      await Promise.resolve();
      await Promise.resolve();

      expect(lambdaClient.message.batchOperations.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          operations: [
            expect.objectContaining({
              data: expect.objectContaining({ content: 'hello updated' }),
              messageId: 'msg-1',
              type: 'create',
            }),
          ],
        }),
      );
    });
  });
});
