import {
  type ChatMessageError,
  type ChatMessagePluginError,
  type ChatTTS,
  type ChatTranslate,
  type CreateMessageParams,
  type MessageMetadata,
  type MessagePluginItem,
  type ModelRankItem,
  type UIChatMessage,
  type UpdateMessageParams,
  type UpdateMessageRAGParams,
} from '@lobechat/types';
import type { HeatmapsProps } from '@lobehub/charts';

import { lambdaClient } from '@/libs/trpc/client';

import { generateMessageId, messagesBatcher } from './batcher';
import { messagesCache } from './cache';

/**
 * Query context for message operations
 * Contains identifiers needed for querying/filtering messages after mutations
 */
export interface MessageQueryContext {
  agentId?: string;
  groupId?: string;
  threadId?: string | null;
  topicId?: string | null;
  topicShareId?: string;
}

export class MessageService {
  // ==========================================
  // Batched Operations (with local cache)
  // These return immediately from local cache
  // ==========================================

  /**
   * Create a message with optimistic update
   * Updates local cache immediately, dispatches to batcher
   */
  createMessage = async (
    params: CreateMessageParams & { id?: string },
  ): Promise<{ id: string; messages: UIChatMessage[] }> => {
    const id = params.id || generateMessageId();
    const now = Date.now();

    if (!params.agentId) {
      console.warn('createMessage: agentId is required');
      return { id, messages: [] };
    }

    const ctx = {
      agentId: params.agentId,
      groupId: params.groupId ?? undefined,
      threadId: params.threadId,
      topicId: params.topicId,
    };

    // Create the message object for local cache
    const newMessage: UIChatMessage = {
      ...params,
      content: params.content || '',
      createdAt: now,
      id,
      meta: {},
      updatedAt: now,
    } as UIChatMessage;

    // Update local cache
    const messages = messagesCache.addMessage(ctx, newMessage);

    // Dispatch to batcher (async, non-blocking)
    messagesBatcher.dispatch({
      context: ctx,
      messageId: id,
      payload: { ...params, id },
      type: 'create',
    });

    return { id, messages };
  };

  /**
   * Update a message with optimistic update
   */
  updateMessage = async (
    id: string,
    value: Partial<UpdateMessageParams>,
    ctx?: MessageQueryContext,
  ): Promise<{ messages?: UIChatMessage[]; success: boolean }> => {
    if (!ctx?.agentId) {
      console.warn('updateMessage: agentId is required');
      return { success: false };
    }

    const context = {
      agentId: ctx.agentId,
      groupId: ctx.groupId,
      threadId: ctx.threadId,
      topicId: ctx.topicId,
    };

    // Update local cache
    const messages = messagesCache.updateMessage(context, id, value as Partial<UIChatMessage>);

    // Dispatch to batcher
    messagesBatcher.dispatch({
      context,
      messageId: id,
      payload: value,
      type: 'update',
    });

    return { messages, success: true };
  };

  /**
   * Update message metadata with optimistic update
   */
  updateMessageMetadata = async (
    id: string,
    value: Partial<MessageMetadata>,
    ctx?: MessageQueryContext,
  ): Promise<{ messages?: UIChatMessage[]; success: boolean }> => {
    if (!ctx?.agentId) {
      console.warn('updateMessageMetadata: agentId is required');
      return { success: false };
    }

    const context = {
      agentId: ctx.agentId,
      groupId: ctx.groupId,
      threadId: ctx.threadId,
      topicId: ctx.topicId,
    };

    // Update local cache
    const messages = messagesCache.updateMessageMetadata(context, id, value);

    // Dispatch to batcher
    messagesBatcher.dispatch({
      context,
      messageId: id,
      payload: value,
      type: 'updateMetadata',
    });

    return { messages, success: true };
  };

  /**
   * Update tool message with optimistic update
   */
  updateToolMessage = async (
    id: string,
    value: {
      content?: string;
      metadata?: Record<string, any>;
      pluginError?: any;
      pluginState?: Record<string, any>;
    },
    ctx?: MessageQueryContext,
  ): Promise<{ messages?: UIChatMessage[]; success: boolean }> => {
    if (!ctx?.agentId) {
      console.warn('updateToolMessage: agentId is required');
      return { success: false };
    }

    const context = {
      agentId: ctx.agentId,
      groupId: ctx.groupId,
      threadId: ctx.threadId,
      topicId: ctx.topicId,
    };

    // Update local cache with the relevant fields
    const updateValue: Partial<UIChatMessage> = {};
    if (value.content !== undefined) updateValue.content = value.content;
    if (value.metadata !== undefined) updateValue.metadata = value.metadata;
    if (value.pluginError !== undefined) (updateValue as any).pluginError = value.pluginError;
    if (value.pluginState !== undefined) (updateValue as any).pluginState = value.pluginState;

    const messages = messagesCache.updateMessage(context, id, updateValue);

    // Dispatch to batcher
    messagesBatcher.dispatch({
      context,
      messageId: id,
      payload: value,
      type: 'updateToolMessage',
    });

    return { messages, success: true };
  };

  /**
   * Remove a message with optimistic update
   */
  removeMessage = async (
    id: string,
    ctx?: MessageQueryContext,
  ): Promise<{ messages?: UIChatMessage[]; success: boolean }> => {
    if (!ctx?.agentId) {
      console.warn('removeMessage: agentId is required');
      return { success: false };
    }

    const context = {
      agentId: ctx.agentId,
      groupId: ctx.groupId,
      threadId: ctx.threadId,
      topicId: ctx.topicId,
    };

    // Remove from local cache
    const messages = messagesCache.removeMessage(context, id);

    // Dispatch to batcher
    messagesBatcher.dispatch({
      context,
      messageId: id,
      payload: {},
      type: 'delete',
    });

    return { messages, success: true };
  };

  // ==========================================
  // Query Operations (with cache)
  // ==========================================

  getMessages = async (params: MessageQueryContext): Promise<UIChatMessage[]> => {
    // For shared topics, always fetch from backend
    if (params.topicShareId) {
      const data = await lambdaClient.message.getMessages.query(params);
      return data as unknown as UIChatMessage[];
    }

    // Check if agentId is provided for cache
    if (params.agentId) {
      const ctx = {
        agentId: params.agentId,
        groupId: params.groupId,
        threadId: params.threadId,
        topicId: params.topicId,
      };

      // Check cache first
      const cached = messagesCache.get(ctx);
      if (cached) {
        return cached;
      }

      // Fetch from backend and cache
      const data = await lambdaClient.message.getMessages.query(params);
      const messages = data as unknown as UIChatMessage[];
      messagesCache.set(ctx, messages);
      return messages;
    }

    // Fallback to backend
    const data = await lambdaClient.message.getMessages.query(params);
    return data as unknown as UIChatMessage[];
  };

  // ==========================================
  // Direct API Operations (no batching)
  // These operations need immediate server response
  // ==========================================

  countMessages = async (params?: {
    endDate?: string;
    range?: [string, string];
    startDate?: string;
  }): Promise<number> => {
    return lambdaClient.message.count.query(params);
  };

  countWords = async (params?: {
    endDate?: string;
    range?: [string, string];
    startDate?: string;
  }): Promise<number> => {
    return lambdaClient.message.countWords.query(params);
  };

  rankModels = async (): Promise<ModelRankItem[]> => {
    return lambdaClient.message.rankModels.query();
  };

  getHeatmaps = async (): Promise<HeatmapsProps['data']> => {
    return lambdaClient.message.getHeatmaps.query();
  };

  updateMessageError = async (id: string, value: ChatMessageError, ctx?: MessageQueryContext) => {
    const error = value.type
      ? value
      : { body: value, message: value.message, type: 'ApplicationRuntimeError' };

    return lambdaClient.message.update.mutate({
      ...ctx,
      id,
      value: { error },
    });
  };

  updateMessagePluginArguments = async (id: string, value: string | Record<string, any>) => {
    const args = typeof value === 'string' ? value : JSON.stringify(value);
    return lambdaClient.message.updateMessagePlugin.mutate({ id, value: { arguments: args } });
  };

  /**
   * Update tool arguments by toolCallId - updates both tool message and parent assistant message in one transaction
   * This is the preferred method for updating tool arguments as it prevents race conditions
   */
  updateToolArguments = async (
    toolCallId: string,
    value: string | Record<string, unknown>,
    ctx?: MessageQueryContext,
  ) => {
    return lambdaClient.message.updateToolArguments.mutate({ ...ctx, toolCallId, value });
  };

  updateMessageTranslate = async (id: string, translate: Partial<ChatTranslate> | false) => {
    return lambdaClient.message.updateTranslate.mutate({ id, value: translate as ChatTranslate });
  };

  updateMessageTTS = async (id: string, tts: Partial<ChatTTS> | false) => {
    return lambdaClient.message.updateTTS.mutate({ id, value: tts });
  };

  updateMessagePluginState = async (
    id: string,
    value: Record<string, any>,
    ctx?: MessageQueryContext,
  ) => {
    return lambdaClient.message.updatePluginState.mutate({ ...ctx, id, value });
  };

  updateMessagePluginError = async (
    id: string,
    error: ChatMessagePluginError | null,
    ctx?: MessageQueryContext,
  ) => {
    return lambdaClient.message.updatePluginError.mutate({ ...ctx, id, value: error as any });
  };

  updateMessagePlugin = async (
    id: string,
    value: Partial<Omit<MessagePluginItem, 'id'>>,
    ctx?: MessageQueryContext,
  ) => {
    return lambdaClient.message.updateMessagePlugin.mutate({ ...ctx, id, value });
  };

  updateMessageRAG = async (id: string, data: UpdateMessageRAGParams, ctx?: MessageQueryContext) => {
    return lambdaClient.message.updateMessageRAG.mutate({ ...ctx, id, value: data });
  };

  removeMessages = async (ids: string[], ctx?: MessageQueryContext) => {
    // Update local cache if context is provided
    if (ctx?.agentId) {
      const context = {
        agentId: ctx.agentId,
        groupId: ctx.groupId,
        threadId: ctx.threadId,
        topicId: ctx.topicId,
      };
      messagesCache.removeMessages(context, ids);
    }

    return lambdaClient.message.removeMessages.mutate({ ...ctx, ids });
  };

  removeMessagesByAssistant = async (sessionId: string, topicId?: string) => {
    return lambdaClient.message.removeMessagesByAssistant.mutate({ sessionId, topicId });
  };

  removeMessagesByGroup = async (groupId: string, topicId?: string) => {
    return lambdaClient.message.removeMessagesByGroup.mutate({ groupId, topicId });
  };

  removeAllMessages = async () => {
    // Clear all cache
    messagesCache.clearAll();
    return lambdaClient.message.removeAllMessages.mutate();
  };

  addFilesToMessage = async (id: string, fileIds: string[], ctx?: MessageQueryContext) => {
    return lambdaClient.message.addFilesToMessage.mutate({ ...ctx, fileIds, id });
  };
}

export const messageService = new MessageService();

// Re-export batcher utilities
export { generateMessageId, messagesBatcher } from './batcher';
export { messagesCache } from './cache';
