import type { UIChatMessage } from '@lobechat/types';

import { messageMapKey, type MessageMapKeyInput } from '@/store/chat/utils/messageMapKey';

/**
 * Local messages cache for optimistic updates
 * Stores messages grouped by context key (agentId + topicId + threadId)
 */
class MessagesCache {
  private cache: Map<string, UIChatMessage[]> = new Map();

  /**
   * Get context key from input
   */
  private getKey(ctx: MessageMapKeyInput): string {
    return messageMapKey(ctx);
  }

  /**
   * Get messages for a context
   */
  get(ctx: MessageMapKeyInput): UIChatMessage[] | undefined {
    return this.cache.get(this.getKey(ctx));
  }

  /**
   * Check if cache has messages for a context
   */
  has(ctx: MessageMapKeyInput): boolean {
    return this.cache.has(this.getKey(ctx));
  }

  /**
   * Set messages for a context (used when loading from backend)
   */
  set(ctx: MessageMapKeyInput, messages: UIChatMessage[]): void {
    this.cache.set(this.getKey(ctx), [...messages]);
  }

  /**
   * Add a message to the cache (optimistic create)
   */
  addMessage(ctx: MessageMapKeyInput, message: UIChatMessage): UIChatMessage[] {
    const key = this.getKey(ctx);
    const messages = this.cache.get(key) || [];
    const updated = [...messages, message];
    this.cache.set(key, updated);
    return updated;
  }

  /**
   * Update a message in the cache (optimistic update)
   */
  updateMessage(
    ctx: MessageMapKeyInput,
    id: string,
    value: Partial<UIChatMessage>,
  ): UIChatMessage[] {
    const key = this.getKey(ctx);
    const messages = this.cache.get(key) || [];
    const updated = messages.map((m) => (m.id === id ? { ...m, ...value, updatedAt: Date.now() } : m));
    this.cache.set(key, updated);
    return updated;
  }

  /**
   * Update message metadata in the cache
   */
  updateMessageMetadata(
    ctx: MessageMapKeyInput,
    id: string,
    metadata: Record<string, any>,
  ): UIChatMessage[] {
    const key = this.getKey(ctx);
    const messages = this.cache.get(key) || [];
    const updated = messages.map((m) =>
      m.id === id
        ? { ...m, metadata: { ...m.metadata, ...metadata }, updatedAt: Date.now() }
        : m,
    );
    this.cache.set(key, updated);
    return updated;
  }

  /**
   * Remove a message from the cache (optimistic delete)
   */
  removeMessage(ctx: MessageMapKeyInput, id: string): UIChatMessage[] {
    const key = this.getKey(ctx);
    const messages = this.cache.get(key) || [];
    const updated = messages.filter((m) => m.id !== id);
    this.cache.set(key, updated);
    return updated;
  }

  /**
   * Remove multiple messages from the cache
   */
  removeMessages(ctx: MessageMapKeyInput, ids: string[]): UIChatMessage[] {
    const key = this.getKey(ctx);
    const messages = this.cache.get(key) || [];
    const idSet = new Set(ids);
    const updated = messages.filter((m) => !idSet.has(m.id));
    this.cache.set(key, updated);
    return updated;
  }

  /**
   * Clear cache for a specific context
   */
  clear(ctx: MessageMapKeyInput): void {
    this.cache.delete(this.getKey(ctx));
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const messagesCache = new MessagesCache();
