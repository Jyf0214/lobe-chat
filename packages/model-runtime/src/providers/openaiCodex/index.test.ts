// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AgentRuntimeErrorType } from '../../types/error';
import { LobeOpenAICodexAI } from './index';

const mockFetch = vi.fn();
global.fetch = mockFetch;

// A valid-looking JWT for testing (header.payload.signature)
const createMockJWT = (payload: Record<string, any>) => {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
};

const MOCK_ACCOUNT_ID = 'org-test-account-123';
const MOCK_JWT = createMockJWT({
  'https://api.openai.com/auth': { account_id: MOCK_ACCOUNT_ID },
  'sub': 'user-123',
});
const MOCK_DEVICE_ID = 'test-device-id';

describe('LobeOpenAICodexAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should throw InvalidOpenAICodexToken when no oauthAccessToken provided', () => {
      expect(() => new LobeOpenAICodexAI({})).toThrow();

      try {
        new LobeOpenAICodexAI({});
      } catch (e: any) {
        expect(e.errorType).toBe(AgentRuntimeErrorType.InvalidOpenAICodexToken);
      }
    });

    it('should accept a valid oauth access token', () => {
      const instance = new LobeOpenAICodexAI({
        chatgptAccountId: MOCK_ACCOUNT_ID,
        oauthAccessToken: MOCK_JWT,
        oaiDeviceId: MOCK_DEVICE_ID,
      });

      expect(instance).toBeInstanceOf(LobeOpenAICodexAI);
    });

    it('should parse account ID from JWT when chatgptAccountId not provided', () => {
      const instance = new LobeOpenAICodexAI({
        oauthAccessToken: MOCK_JWT,
        oaiDeviceId: MOCK_DEVICE_ID,
      });

      expect(instance).toBeInstanceOf(LobeOpenAICodexAI);
    });

    it('should throw when JWT has no account ID claim', () => {
      const badJWT = createMockJWT({ foo: 'bar' });

      expect(
        () =>
          new LobeOpenAICodexAI({
            oauthAccessToken: badJWT,
          }),
      ).toThrow();
    });
  });

  describe('models', () => {
    it('should return predefined Codex models', async () => {
      const instance = new LobeOpenAICodexAI({
        chatgptAccountId: MOCK_ACCOUNT_ID,
        oauthAccessToken: MOCK_JWT,
        oaiDeviceId: MOCK_DEVICE_ID,
      });

      const models = await instance.models();

      expect(models).toBeInstanceOf(Array);
      expect(models.length).toBeGreaterThan(0);

      const modelIds = models.map((m) => m.id);
      expect(modelIds).toContain('gpt-5-codex');
    });
  });

  describe('chat', () => {
    it('should call the correct API endpoint with proper headers', async () => {
      const instance = new LobeOpenAICodexAI({
        chatgptAccountId: MOCK_ACCOUNT_ID,
        oauthAccessToken: MOCK_JWT,
        oaiDeviceId: MOCK_DEVICE_ID,
      });

      const mockSSE =
        'data: {"type":"response.output_text.delta","delta":"Hello"}\n\ndata: [DONE]\n\n';
      const encoder = new TextEncoder();
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(mockSSE));
          controller.close();
        },
      });

      mockFetch.mockResolvedValueOnce({
        body: mockStream,
        ok: true,
        status: 200,
      });

      const response = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'gpt-5-codex',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://chatgpt.com/backend-api/codex/responses',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${MOCK_JWT}`,
            'Content-Type': 'application/json',
            'chatgpt-account-id': MOCK_ACCOUNT_ID,
            'oai-device-id': MOCK_DEVICE_ID,
          }),
          method: 'POST',
        }),
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toHaveProperty('input');
      expect(body).toHaveProperty('model', 'gpt-5-codex');
      expect(body).toHaveProperty('stream', true);
      expect(body).not.toHaveProperty('messages');

      expect(response).toBeInstanceOf(Response);
    });

    it('should include instructions when system message present', async () => {
      const instance = new LobeOpenAICodexAI({
        chatgptAccountId: MOCK_ACCOUNT_ID,
        oauthAccessToken: MOCK_JWT,
        oaiDeviceId: MOCK_DEVICE_ID,
      });

      const mockSSE =
        'data: {"type":"response.output_text.delta","delta":"Hi"}\n\ndata: [DONE]\n\n';
      const encoder = new TextEncoder();
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(mockSSE));
          controller.close();
        },
      });

      mockFetch.mockResolvedValueOnce({
        body: mockStream,
        ok: true,
        status: 200,
      });

      await instance.chat({
        messages: [
          { content: 'You are a helpful assistant', role: 'system' },
          { content: 'Hello', role: 'user' },
        ],
        model: 'gpt-5-codex',
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.instructions).toBe('You are a helpful assistant');
    });

    it('should include tools when provided', async () => {
      const instance = new LobeOpenAICodexAI({
        chatgptAccountId: MOCK_ACCOUNT_ID,
        oauthAccessToken: MOCK_JWT,
        oaiDeviceId: MOCK_DEVICE_ID,
      });

      const mockSSE = 'data: {"type":"response.output_text.delta","delta":"r"}\n\ndata: [DONE]\n\n';
      const encoder = new TextEncoder();
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(mockSSE));
          controller.close();
        },
      });

      mockFetch.mockResolvedValueOnce({
        body: mockStream,
        ok: true,
        status: 200,
      });

      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'gpt-5-codex',
        tools: [
          {
            function: {
              description: 'Get weather',
              name: 'get_weather',
              parameters: { properties: { city: { type: 'string' } }, type: 'object' },
            },
            type: 'function',
          },
        ],
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.tools).toHaveLength(1);
      expect(body.tools[0].name).toBe('get_weather');
    });

    it('should throw mapped error on 401 without retrying', async () => {
      const instance = new LobeOpenAICodexAI({
        chatgptAccountId: MOCK_ACCOUNT_ID,
        oauthAccessToken: MOCK_JWT,
        oaiDeviceId: MOCK_DEVICE_ID,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(
        instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'gpt-5-codex',
        }),
      ).rejects.toMatchObject({
        errorType: AgentRuntimeErrorType.InvalidOpenAICodexToken,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
