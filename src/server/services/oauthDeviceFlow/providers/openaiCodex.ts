import { type OAuthDeviceFlowConfig } from '@/types/aiProvider';

import { OAuthDeviceFlowService } from '../index';

export interface OpenAICodexTokens {
  chatgptAccountId: string;
  oaiDeviceId: string;
  oauthAccessToken: string;
  oauthTokenExpiresAt: number;
}

export class OpenAICodexOAuthService extends OAuthDeviceFlowService {
  async completeAuthFlow(
    config: OAuthDeviceFlowConfig,
    deviceCode: string,
  ): Promise<OpenAICodexTokens | null> {
    const pollResult = await this.pollForToken(config, deviceCode);

    if (pollResult.status !== 'success' || !pollResult.tokens) {
      return null;
    }

    const oauthToken = pollResult.tokens.accessToken;
    const chatgptAccountId = this.parseAccountIdFromJWT(oauthToken);
    const oaiDeviceId = crypto.randomUUID();
    const oauthTokenExpiresAt = pollResult.tokens.expiresIn
      ? Date.now() + pollResult.tokens.expiresIn * 1000
      : Date.now() + 3600 * 1000;

    return {
      chatgptAccountId,
      oauthAccessToken: oauthToken,
      oauthTokenExpiresAt,
      oaiDeviceId,
    };
  }

  private parseAccountIdFromJWT(token: string): string {
    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        throw new Error('Invalid JWT format');
      }

      const payload = parts[1];
      const padded = payload.replaceAll('-', '+').replaceAll('_', '/');
      const decoded = Buffer.from(padded, 'base64').toString('utf8');
      const parsed = JSON.parse(decoded);

      const accountId =
        parsed['https://api.openai.com/auth']?.account_id ||
        parsed['chatgpt_account_id'] ||
        parsed['account_id'] ||
        parsed.sub;

      if (!accountId) {
        throw new Error('No account ID found in JWT claims');
      }

      return accountId;
    } catch (e) {
      throw new Error(`Failed to parse account ID from OpenAI JWT: ${(e as Error).message}`);
    }
  }
}
