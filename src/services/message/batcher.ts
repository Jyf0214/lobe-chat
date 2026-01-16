import { nanoid } from 'nanoid';

import { lambdaClient } from '@/libs/trpc/client';
import { messageMapKey, type MessageMapKeyInput } from '@/store/chat/utils/messageMapKey';

// ==========================================
// Types
// ==========================================

export type BatchOperationType =
  | 'create'
  | 'update'
  | 'updateMetadata'
  | 'updateToolMessage'
  | 'updateToolArguments'
  | 'delete';

export interface BatchOperation {
  context: MessageMapKeyInput;
  contextKey: string;
  messageId: string;
  payload: Record<string, any>;
  type: BatchOperationType;
}

interface BatchOperationsInput {
  agentId?: string;
  groupId?: string;
  operations: Array<{
    data?: Record<string, any>;
    messageId: string;
    type: BatchOperationType;
  }>;
  threadId?: string | null;
  topicId?: string | null;
}

// ==========================================
// MessagesBatcher Class
// ==========================================

/**
 * Messages Batcher - batches multiple message operations into a single request
 *
 * Uses microtask scheduling to merge operations within the same event loop,
 * then flushes them asynchronously without blocking the caller.
 */
export class MessagesBatcher {
  private flushPromise: Promise<void> | null = null;
  private queue: BatchOperation[] = [];

  // ==========================================
  // Public API
  // ==========================================

  /**
   * Dispatch an operation to the batcher queue
   * Operations are automatically merged if they target the same message
   * Triggers an async flush via microtask
   */
  dispatch(op: Omit<BatchOperation, 'contextKey'>): void {
    const contextKey = messageMapKey(op.context);
    this.mergeOrPush({ ...op, contextKey });
    this.scheduleFlush();
  }

  /**
   * Get the current queue length (for testing/debugging)
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  // ==========================================
  // Queue Management
  // ==========================================

  private mergeOrPush(op: BatchOperation): void {
    const existingIndex = this.queue.findIndex(
      (o) => o.messageId === op.messageId && o.contextKey === op.contextKey,
    );

    if (existingIndex >= 0) {
      const existing = this.queue[existingIndex];

      // Merge strategies based on operation type combinations
      if (existing.type === 'create' && op.type === 'update') {
        // create + update = create with merged payload
        existing.payload = { ...existing.payload, ...op.payload };
      } else if (existing.type === 'create' && op.type === 'updateMetadata') {
        // create + updateMetadata = create with merged metadata
        existing.payload = {
          ...existing.payload,
          metadata: { ...existing.payload.metadata, ...op.payload },
        };
      } else if (existing.type === 'create' && op.type === 'delete') {
        // create + delete = cancel out (remove from queue)
        this.queue.splice(existingIndex, 1);
        return;
      } else if (existing.type === 'update' && op.type === 'update') {
        // update + update = merge updates
        existing.payload = { ...existing.payload, ...op.payload };
      } else if (existing.type === 'update' && op.type === 'updateMetadata') {
        // update + updateMetadata = merge
        existing.payload = {
          ...existing.payload,
          metadata: { ...existing.payload.metadata, ...op.payload },
        };
      } else if (existing.type === 'update' && op.type === 'delete') {
        // update + delete = just delete
        this.queue[existingIndex] = op;
      } else if (existing.type === 'updateMetadata' && op.type === 'updateMetadata') {
        // metadata + metadata = merge
        existing.payload = { ...existing.payload, ...op.payload };
      } else if (existing.type === 'updateMetadata' && op.type === 'delete') {
        // metadata + delete = just delete
        this.queue[existingIndex] = op;
      } else if (existing.type === 'updateToolMessage' && op.type === 'updateToolMessage') {
        // toolMessage + toolMessage = merge
        existing.payload = { ...existing.payload, ...op.payload };
      } else if (existing.type === 'updateToolMessage' && op.type === 'delete') {
        // toolMessage + delete = just delete
        this.queue[existingIndex] = op;
      } else {
        // Other combinations: just append
        this.queue.push(op);
      }
    } else {
      this.queue.push(op);
    }
  }

  /**
   * Schedule a flush using microtask
   * This ensures all synchronous operations in the same event loop are batched together
   */
  private scheduleFlush(): void {
    if (!this.flushPromise) {
      this.flushPromise = Promise.resolve().then(() => {
        this.flushPromise = null;
        this.flush();
      });
    }
  }

  // ==========================================
  // Flush Operations
  // ==========================================

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const ops = [...this.queue];
    this.queue = [];

    // Group by context
    const byContext = this.groupByContext(ops);

    // Send batches in parallel for different contexts
    await Promise.all(
      Object.entries(byContext).map(([contextKey, contextOps]) =>
        this.sendBatch(contextKey, contextOps),
      ),
    );
  }

  private groupByContext(ops: BatchOperation[]): Record<string, BatchOperation[]> {
    return ops.reduce(
      (acc, op) => {
        if (!acc[op.contextKey]) acc[op.contextKey] = [];
        acc[op.contextKey].push(op);
        return acc;
      },
      {} as Record<string, BatchOperation[]>,
    );
  }

  private async sendBatch(_contextKey: string, ops: BatchOperation[]): Promise<void> {
    try {
      const context = ops[0].context;

      const input: BatchOperationsInput = {
        agentId: context.agentId,
        groupId: context.groupId,
        operations: ops.map((op) => ({
          data: op.payload,
          messageId: op.messageId,
          type: op.type,
        })),
        threadId: context.threadId,
        topicId: context.topicId,
      };

      await lambdaClient.message.batchOperations.mutate(input);
    } catch (error) {
      // Log error but don't re-queue - local cache is source of truth
      console.error('Batch sync failed:', error);
    }
  }
}

// ==========================================
// Helper: Generate Message ID
// ==========================================

/**
 * Generate a new message ID (frontend-generated)
 * This allows optimistic updates without waiting for server
 */
export const generateMessageId = (): string => {
  return nanoid();
};

// ==========================================
// Singleton Instance
// ==========================================

export const messagesBatcher = new MessagesBatcher();
