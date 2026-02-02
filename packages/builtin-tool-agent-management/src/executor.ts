/**
 * Agent Management Executor
 *
 * Handles all agent management tool calls for creating, updating,
 * deleting, searching, and calling AI agents.
 * Delegates to AgentManagerRuntime for actual implementation.
 */
import { AgentManagerRuntime } from '@lobechat/agent-manager-runtime';
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

const runtime = new AgentManagerRuntime({
  agentService,
  discoverService,
});

class AgentManagementExecutor extends BaseExecutor<typeof AgentManagementApiName> {
  readonly identifier = AgentManagementIdentifier;
  protected readonly apiEnum = AgentManagementApiName;

  // ==================== Agent CRUD ====================

  createAgent = async (params: CreateAgentParams): Promise<BuiltinToolResult> => {
    return runtime.createAgent(params);
  };

  updateAgent = async (params: UpdateAgentParams): Promise<BuiltinToolResult> => {
    const { agentId, config, meta } = params;
    return runtime.updateAgentConfig(agentId, { config, meta });
  };

  deleteAgent = async (params: DeleteAgentParams): Promise<BuiltinToolResult> => {
    return runtime.deleteAgent(params.agentId);
  };

  // ==================== Search ====================

  searchAgent = async (params: SearchAgentParams): Promise<BuiltinToolResult> => {
    return runtime.searchAgents(params);
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
