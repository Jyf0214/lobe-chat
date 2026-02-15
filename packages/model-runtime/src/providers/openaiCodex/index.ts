import { type ChatModelCard } from '@lobechat/types';
import { ModelProvider } from 'model-bank';

import { type LobeRuntimeAI } from '../../core/BaseAI';
import { convertOpenAIResponseInputs } from '../../core/contextBuilders/openai';
import { OpenAIResponsesStream } from '../../core/streams/openai/responsesStream';
import { createSSEDataExtractor } from '../../core/streams/protocol';
import { type ChatMethodOptions, type ChatStreamPayload } from '../../types';
import { AgentRuntimeErrorType } from '../../types/error';
import { AgentRuntimeError } from '../../utils/createError';
import { StreamingResponse } from '../../utils/response';

const CODEX_API_URL = 'https://chatgpt.com/backend-api/codex/responses';

const MAX_TOTAL_ATTEMPTS = 5;
const MAX_RATE_LIMIT_RETRIES = 3;

const CODEX_MODELS: ChatModelCard[] = [
  { displayName: 'GPT-5 Codex', enabled: true, id: 'gpt-5-codex', type: 'chat' },
  { displayName: 'Codex Mini', enabled: true, id: 'codex-mini', type: 'chat' },
];

export interface LobeOpenAICodexAIParams {
  chatgptAccountId?: string;
  oaiDeviceId?: string;
  oauthAccessToken?: string;
}

export class LobeOpenAICodexAI implements LobeRuntimeAI {
  private chatgptAccountId: string;
  private oauthAccessToken: string;
  private oaiDeviceId: string;

  constructor({ oauthAccessToken, chatgptAccountId, oaiDeviceId }: LobeOpenAICodexAIParams = {}) {
    if (!oauthAccessToken) {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidOpenAICodexToken, {
        message: 'OAuth access token is required for OpenAI Codex',
      });
    }

    this.oauthAccessToken = oauthAccessToken;
    this.chatgptAccountId = chatgptAccountId || this.parseAccountIdFromJWT(oauthAccessToken);
    this.oaiDeviceId = oaiDeviceId || crypto.randomUUID();
  }

  async chat(payload: ChatStreamPayload, options?: ChatMethodOptions) {
    return this.executeWithRetry(async () => {
      const { messages, model, tools, ...rest } = payload;

      const input = await convertOpenAIResponseInputs(messages);

      const body: Record<string, any> = {
        input,
        model,
        stream: true,
      };

      if (rest.reasoning?.effort || rest.reasoning_effort) {
        body.reasoning = { effort: rest.reasoning?.effort || rest.reasoning_effort };
      }

      if (payload.messages?.[0]?.role === 'system') {
        body.instructions = payload.messages[0].content;
      }

      if (tools && tools.length > 0) {
        body.tools = tools.map((tool) => ({
          description: tool.function.description,
          name: tool.function.name,
          parameters: tool.function.parameters,
          type: 'function',
        }));
      }

      const response = await fetch(CODEX_API_URL, {
        body: JSON.stringify(body),
        headers: {
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${this.oauthAccessToken}`,
          'Content-Type': 'application/json',
          'chatgpt-account-id': this.chatgptAccountId,
          'oai-device-id': this.oaiDeviceId,
        },
        method: 'POST',
        signal: options?.signal,
      });

      if (!response.ok) {
        throw { response, status: response.status };
      }

      const stream = response.body!.pipeThrough(createSSEDataExtractor());

      return StreamingResponse(
        OpenAIResponsesStream(stream, {
          callbacks: options?.callback,
          payload: { model, provider: ModelProvider.OpenAICodex },
        }),
        { headers: options?.headers },
      );
    });
  }

  async models(): Promise<ChatModelCard[]> {
    return CODEX_MODELS;
  }

  private parseAccountIdFromJWT(token: string): string {
    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        throw new Error('Invalid JWT format');
      }

      const payload = parts[1];
      const padded = payload.replaceAll('-', '+').replaceAll('_', '/');
      const decoded = atob(padded);
      const parsed = JSON.parse(decoded);

      const accountId =
        parsed['https://api.openai.com/auth']?.account_id ||
        parsed['chatgpt_account_id'] ||
        parsed['account_id'] ||
        parsed.sub;

      if (!accountId) {
        throw new Error('No account ID found in JWT');
      }

      return accountId;
    } catch (e) {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidOpenAICodexToken, {
        message: `Failed to parse account ID from JWT: ${(e as Error).message}`,
      });
    }
  }

  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let totalAttempts = 0;
    let rateLimitAttempts = 0;

    while (totalAttempts < MAX_TOTAL_ATTEMPTS) {
      totalAttempts++;

      try {
        return await fn();
      } catch (error: any) {
        const status = error?.status ?? error?.response?.status;

        if (status === 401) {
          throw this.mapError(error);
        }

        if (status === 429 && rateLimitAttempts < MAX_RATE_LIMIT_RETRIES) {
          rateLimitAttempts++;
          const retryAfter = this.getRetryAfterMs(error) ?? 1000 * Math.pow(2, rateLimitAttempts);

          await new Promise<void>((resolve) => {
            setTimeout(resolve, Math.min(retryAfter, 10_000));
          });
          continue;
        }

        throw this.mapError(error);
      }
    }

    throw AgentRuntimeError.chat({
      endpoint: CODEX_API_URL,
      error: { message: 'Max retry attempts exceeded' },
      errorType: AgentRuntimeErrorType.ProviderBizError,
      provider: ModelProvider.OpenAICodex,
    });
  }

  private getRetryAfterMs(error: any): number | undefined {
    const header = error?.response?.headers?.get?.('Retry-After');
    if (header) {
      const seconds = parseInt(header, 10);
      if (!isNaN(seconds)) return seconds * 1000;
    }
    return undefined;
  }

  private mapError(error: any) {
    const status = error?.status ?? error?.response?.status;

    switch (status) {
      case 401: {
        return AgentRuntimeError.chat({
          endpoint: CODEX_API_URL,
          error,
          errorType: AgentRuntimeErrorType.InvalidOpenAICodexToken,
          provider: ModelProvider.OpenAICodex,
        });
      }
      case 403: {
        return AgentRuntimeError.chat({
          endpoint: CODEX_API_URL,
          error,
          errorType: AgentRuntimeErrorType.PermissionDenied,
          provider: ModelProvider.OpenAICodex,
        });
      }
      case 429: {
        return AgentRuntimeError.chat({
          endpoint: CODEX_API_URL,
          error,
          errorType: AgentRuntimeErrorType.QuotaLimitReached,
          provider: ModelProvider.OpenAICodex,
        });
      }
      default: {
        return AgentRuntimeError.chat({
          endpoint: CODEX_API_URL,
          error,
          errorType: AgentRuntimeErrorType.ProviderBizError,
          provider: ModelProvider.OpenAICodex,
        });
      }
    }
  }
}

export default LobeOpenAICodexAI;
