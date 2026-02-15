// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OAuthDeviceFlowService } from '../../index';
import { getOAuthService } from '../../providers/githubCopilot';
import { OpenAICodexOAuthService } from '../../providers/openaiCodex';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const createMockJWT = (payload: Record<string, any>) => {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
};

describe('OpenAICodexOAuthService', () => {
  let service: OpenAICodexOAuthService;

  const mockConfig = {
    clientId: 'app_EMoamEEZ73f0CkXaXp7hrann',
    defaultPollingInterval: 5,
    deviceCodeEndpoint: 'https://auth0.openai.com/oauth/device/code',
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    tokenEndpoint: 'https://auth0.openai.com/oauth/token',
  };

  beforeEach(() => {
    service = new OpenAICodexOAuthService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('completeAuthFlow', () => {
    it('should complete auth flow successfully with JWT containing account_id', async () => {
      const mockJWT = createMockJWT({
        'https://api.openai.com/auth': { account_id: 'org-abc123' },
        'sub': 'user-xyz',
      });

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            access_token: mockJWT,
            expires_in: 3600,
            token_type: 'bearer',
          }),
        ok: true,
      });

      const result = await service.completeAuthFlow(mockConfig, 'device-code-123');

      expect(result).not.toBeNull();
      expect(result!.oauthAccessToken).toBe(mockJWT);
      expect(result!.chatgptAccountId).toBe('org-abc123');
      expect(result!.oaiDeviceId).toBeDefined();
      expect(result!.oauthTokenExpiresAt).toBeGreaterThan(Date.now());
    });

    it('should fallback to sub claim when account_id not present', async () => {
      const mockJWT = createMockJWT({ sub: 'user-fallback-123' });

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            access_token: mockJWT,
            expires_in: 3600,
            token_type: 'bearer',
          }),
        ok: true,
      });

      const result = await service.completeAuthFlow(mockConfig, 'device-code-123');

      expect(result).not.toBeNull();
      expect(result!.chatgptAccountId).toBe('user-fallback-123');
    });

    it('should return null when poll returns pending status', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ error: 'authorization_pending' }),
        ok: true,
      });

      const result = await service.completeAuthFlow(mockConfig, 'device-code-123');

      expect(result).toBeNull();
    });

    it('should return null when poll returns expired status', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ error: 'expired_token' }),
        ok: true,
      });

      const result = await service.completeAuthFlow(mockConfig, 'device-code-123');

      expect(result).toBeNull();
    });

    it('should throw when JWT has no identifiable account claim', async () => {
      const badJWT = createMockJWT({ foo: 'bar' });

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            access_token: badJWT,
            expires_in: 3600,
            token_type: 'bearer',
          }),
        ok: true,
      });

      await expect(service.completeAuthFlow(mockConfig, 'device-code-123')).rejects.toThrow(
        'Failed to parse account ID from OpenAI JWT',
      );
    });

    it('should throw when JWT format is invalid', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            access_token: 'not-a-jwt',
            expires_in: 3600,
            token_type: 'bearer',
          }),
        ok: true,
      });

      await expect(service.completeAuthFlow(mockConfig, 'device-code-123')).rejects.toThrow(
        'Failed to parse account ID from OpenAI JWT',
      );
    });
  });
});

describe('getOAuthService', () => {
  it('should return OpenAICodexOAuthService for openaicodex provider', () => {
    const service = getOAuthService('openaicodex');
    expect(service).toBeInstanceOf(OpenAICodexOAuthService);
  });

  it('should return base OAuthDeviceFlowService for unknown providers', () => {
    const service = getOAuthService('unknown');
    expect(service).toBeInstanceOf(OAuthDeviceFlowService);
  });
});
