/**
 * Agent Management Executor
 *
 * Handles all agent management tool calls for creating, updating,
 * deleting, searching, and calling AI agents.
 */
import { BaseExecutor, type BuiltinToolContext, type BuiltinToolResult } from '@lobechat/types';

import { agentService } from '@/services/agent';
import { discoverService } from '@/services/discover';

import {
  AgentManagementApiName,
  AgentManagementIdentifier,
  type CallAgentParams,
  type CreateAgentParams,
  type DeleteAgentParams,
  type SearchAgentParams,
  type UpdateAgentParams,
} from './types';

class AgentManagementExecutor extends BaseExecutor<typeof AgentManagementApiName> {
  readonly identifier = AgentManagementIdentifier;
  protected readonly apiEnum = AgentManagementApiName;

  // ==================== Agent CRUD ====================

  createAgent = async (params: CreateAgentParams): Promise<BuiltinToolResult> => {
    try {
      const config = {
        avatar: params.avatar,
        backgroundColor: params.backgroundColor,
        description: params.description,
        model: params.model,
        openingMessage: params.openingMessage,
        openingQuestions: params.openingQuestions,
        plugins: params.plugins,
        provider: params.provider,
        systemRole: params.systemRole,
        tags: params.tags,
        title: params.title,
      };

      const result = await agentService.createAgent({ config });

      return {
        content: `Successfully created agent "${params.title}" with ID: ${result.agentId || result.sessionId}`,
        state: {
          agentId: result.agentId,
          sessionId: result.sessionId,
          success: true,
        },
        success: true,
      };
    } catch (error) {
      return {
        content: `Failed to create agent: ${error instanceof Error ? error.message : 'Unknown error'}`,
        state: {
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false,
        },
        success: false,
      };
    }
  };

  updateAgent = async (params: UpdateAgentParams): Promise<BuiltinToolResult> => {
    try {
      const { agentId, config, meta } = params;

      if (config) {
        await agentService.updateAgentConfig(agentId, config);
      }

      if (meta) {
        await agentService.updateAgentMeta(agentId, meta);
      }

      const updatedFields: string[] = [];
      if (config) {
        updatedFields.push(...Object.keys(config));
      }
      if (meta) {
        updatedFields.push(...Object.keys(meta));
      }

      return {
        content: `Successfully updated agent ${agentId}. Updated fields: ${updatedFields.join(', ') || 'none'}`,
        state: {
          agentId,
          config: config
            ? {
                newValues: config as Record<string, unknown>,
                previousValues: {},
                updatedFields: Object.keys(config),
              }
            : undefined,
          meta: meta
            ? {
                newValues: meta,
                previousValues: {},
                updatedFields: Object.keys(meta),
              }
            : undefined,
          success: true,
        },
        success: true,
      };
    } catch (error) {
      return {
        content: `Failed to update agent: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      };
    }
  };

  deleteAgent = async (params: DeleteAgentParams): Promise<BuiltinToolResult> => {
    try {
      await agentService.removeAgent(params.agentId);

      return {
        content: `Successfully deleted agent ${params.agentId}`,
        state: {
          agentId: params.agentId,
          success: true,
        },
        success: true,
      };
    } catch (error) {
      return {
        content: `Failed to delete agent: ${error instanceof Error ? error.message : 'Unknown error'}`,
        state: {
          agentId: params.agentId,
          success: false,
        },
        success: false,
      };
    }
  };

  // ==================== Search ====================

  searchAgent = async (params: SearchAgentParams): Promise<BuiltinToolResult> => {
    try {
      const source = params.source || 'all';
      const limit = Math.min(params.limit || 10, 20);
      const agents: Array<{
        avatar?: string;
        backgroundColor?: string;
        description?: string;
        id: string;
        isMarket?: boolean;
        title?: string;
      }> = [];

      // Search user's agents
      if (source === 'user' || source === 'all') {
        const userAgents = await agentService.queryAgents({
          keyword: params.keyword,
          limit,
        });

        agents.push(
          ...userAgents.map(
            (agent: {
              avatar?: string | null;
              backgroundColor?: string | null;
              description?: string | null;
              id: string;
              title?: string | null;
            }) => ({
              avatar: agent.avatar ?? undefined,
              backgroundColor: agent.backgroundColor ?? undefined,
              description: agent.description ?? undefined,
              id: agent.id,
              isMarket: false,
              title: agent.title ?? undefined,
            }),
          ),
        );
      }

      // Search marketplace agents
      if (source === 'market' || source === 'all') {
        const marketAgents = await discoverService.getAssistantList({
          pageSize: limit,
          q: params.keyword,
          ...(params.category && { category: params.category }),
        });

        agents.push(
          ...marketAgents.items.map((agent) => ({
            avatar: agent.avatar,
            backgroundColor: agent.backgroundColor,
            description: agent.description,
            id: agent.identifier,
            isMarket: true,
            title: agent.title,
          })),
        );
      }

      // Deduplicate and limit results
      const uniqueAgents = agents.slice(0, limit);

      const agentList = uniqueAgents
        .map((a) => `- ${a.title || 'Untitled'} (${a.id})${a.isMarket ? ' [Market]' : ''}`)
        .join('\n');

      return {
        content:
          uniqueAgents.length > 0
            ? `Found ${uniqueAgents.length} agents:\n${agentList}`
            : 'No agents found matching your search criteria.',
        state: {
          agents: uniqueAgents,
          keyword: params.keyword,
          source,
          totalCount: uniqueAgents.length,
        },
        success: true,
      };
    } catch (error) {
      return {
        content: `Failed to search agents: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      };
    }
  };

  // ==================== Execution ====================

  callAgent = async (
    params: CallAgentParams,
    ctx: BuiltinToolContext,
  ): Promise<BuiltinToolResult> => {
    const { agentId, instruction, runAsTask, taskTitle, timeout } = params;

    if (runAsTask) {
      // Execute as background task
      if (ctx.groupOrchestration && ctx.registerAfterCompletion) {
        ctx.registerAfterCompletion(() =>
          ctx.groupOrchestration!.triggerExecuteTask({
            agentId,
            instruction,
            skipCallSupervisor: true,
            supervisorAgentId: ctx.agentId!,
            timeout: timeout || 1_800_000,
            toolMessageId: ctx.messageId,
          }),
        );
      }

      return {
        content: `Triggered async task for agent "${agentId}": ${taskTitle || 'Task'}`,
        state: {
          agentId,
          instruction,
          mode: 'task',
        },
        stop: true,
        success: true,
      };
    }

    // Execute as synchronous speak
    if (ctx.groupOrchestration && ctx.registerAfterCompletion) {
      ctx.registerAfterCompletion(() =>
        ctx.groupOrchestration!.triggerSpeak({
          agentId,
          instruction,
          skipCallSupervisor: true,
          supervisorAgentId: ctx.agentId!,
        }),
      );
    }

    return {
      content: `Called agent "${agentId}" to respond.`,
      state: {
        agentId,
        instruction,
        mode: 'speak',
      },
      stop: true,
      success: true,
    };
  };
}

export const agentManagementExecutor = new AgentManagementExecutor();
