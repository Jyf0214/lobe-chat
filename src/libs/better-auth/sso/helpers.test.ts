import { describe, expect, it } from 'vitest';

import { DEFAULT_OIDC_SCOPES, buildOidcConfig } from './helpers';

describe('buildOidcConfig', () => {
  const validInput = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    issuer: 'https://auth.example.com',
    providerId: 'test-provider',
  };

  describe('basic functionality', () => {
    it('should build OIDC config with required fields', () => {
      const config = buildOidcConfig(validInput);

      expect(config).toEqual({
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        discoveryUrl: 'https://auth.example.com/.well-known/openid-configuration',
        pkce: true,
        providerId: 'test-provider',
        scopes: DEFAULT_OIDC_SCOPES,
      });
    });

    it('should use default OIDC scopes when not specified', () => {
      const config = buildOidcConfig(validInput);

      expect(config.scopes).toEqual(['openid', 'email', 'profile']);
    });

    it('should use custom scopes when provided', () => {
      const config = buildOidcConfig({
        ...validInput,
        scopes: ['openid', 'custom-scope'],
      });

      expect(config.scopes).toEqual(['openid', 'custom-scope']);
    });

    it('should use pkce=true by default', () => {
      const config = buildOidcConfig(validInput);

      expect(config.pkce).toBe(true);
    });

    it('should allow disabling pkce', () => {
      const config = buildOidcConfig({
        ...validInput,
        pkce: false,
      });

      expect(config.pkce).toBe(false);
    });
  });

  describe('issuer normalization', () => {
    it('should remove trailing slash from issuer', () => {
      const config = buildOidcConfig({
        ...validInput,
        issuer: 'https://auth.example.com/',
      });

      expect(config.discoveryUrl).toBe('https://auth.example.com/.well-known/openid-configuration');
    });

    it('should trim whitespace from issuer', () => {
      const config = buildOidcConfig({
        ...validInput,
        issuer: '  https://auth.example.com  ',
      });

      expect(config.discoveryUrl).toBe('https://auth.example.com/.well-known/openid-configuration');
    });

    it('should handle issuer with multiple trailing slashes', () => {
      const config = buildOidcConfig({
        ...validInput,
        issuer: 'https://auth.example.com///',
      });

      expect(config.discoveryUrl).toBe(
        'https://auth.example.com//.well-known/openid-configuration',
      );
    });

    it('should preserve existing .well-known path in issuer', () => {
      const config = buildOidcConfig({
        ...validInput,
        issuer: 'https://auth.example.com/.well-known/openid-configuration',
      });

      expect(config.discoveryUrl).toBe('https://auth.example.com/.well-known/openid-configuration');
    });

    it('should preserve custom .well-known path in issuer', () => {
      const config = buildOidcConfig({
        ...validInput,
        issuer: 'https://auth.example.com/.well-known/custom-oidc-config',
      });

      expect(config.discoveryUrl).toBe('https://auth.example.com/.well-known/custom-oidc-config');
    });

    it('should handle issuer with .well-known and trailing slash', () => {
      const config = buildOidcConfig({
        ...validInput,
        issuer: 'https://auth.example.com/.well-known/openid-configuration/',
      });

      expect(config.discoveryUrl).toBe('https://auth.example.com/.well-known/openid-configuration');
    });
  });

  describe('validation and error handling', () => {
    it('should throw error when clientId is missing', () => {
      expect(() =>
        buildOidcConfig({
          ...validInput,
          clientId: undefined,
        }),
      ).toThrow('[Better-Auth] test-provider OAuth enabled but missing credentials');
    });

    it('should throw error when clientId is empty string', () => {
      expect(() =>
        buildOidcConfig({
          ...validInput,
          clientId: '',
        }),
      ).toThrow('[Better-Auth] test-provider OAuth enabled but missing credentials');
    });

    it('should throw error when clientSecret is missing', () => {
      expect(() =>
        buildOidcConfig({
          ...validInput,
          clientSecret: undefined,
        }),
      ).toThrow('[Better-Auth] test-provider OAuth enabled but missing credentials');
    });

    it('should throw error when clientSecret is empty string', () => {
      expect(() =>
        buildOidcConfig({
          ...validInput,
          clientSecret: '',
        }),
      ).toThrow('[Better-Auth] test-provider OAuth enabled but missing credentials');
    });

    it('should throw error when issuer is missing', () => {
      expect(() =>
        buildOidcConfig({
          ...validInput,
          issuer: undefined,
        }),
      ).toThrow('[Better-Auth] test-provider OAuth enabled but missing credentials');
    });

    it('should throw error when issuer is empty string', () => {
      expect(() =>
        buildOidcConfig({
          ...validInput,
          issuer: '',
        }),
      ).toThrow('[Better-Auth] test-provider OAuth enabled but missing credentials');
    });

    it('should throw error when issuer is only whitespace', () => {
      expect(() =>
        buildOidcConfig({
          ...validInput,
          issuer: '   ',
        }),
      ).toThrow('[Better-Auth] test-provider OAuth enabled but missing credentials');
    });

    it('should include provider ID in error message', () => {
      expect(() =>
        buildOidcConfig({
          ...validInput,
          clientId: undefined,
          providerId: 'custom-provider',
        }),
      ).toThrow('custom-provider');
    });
  });

  describe('overrides', () => {
    it('should apply overrides to config', () => {
      const config = buildOidcConfig({
        ...validInput,
        overrides: {
          redirectURI: 'https://app.example.com/callback',
        },
      });

      expect(config.redirectURI).toBe('https://app.example.com/callback');
    });

    it('should allow overriding default fields with overrides', () => {
      const config = buildOidcConfig({
        ...validInput,
        scopes: ['openid'],
        overrides: {
          scopes: ['openid', 'override-scope'],
        },
      });

      expect(config.scopes).toEqual(['openid', 'override-scope']);
    });

    it('should handle empty overrides object', () => {
      const config = buildOidcConfig({
        ...validInput,
        overrides: {},
      });

      expect(config.discoveryUrl).toBe('https://auth.example.com/.well-known/openid-configuration');
    });
  });

  describe('real-world scenarios', () => {
    it('should handle Google OIDC configuration', () => {
      const config = buildOidcConfig({
        clientId: 'google-client-id',
        clientSecret: 'google-client-secret',
        issuer: 'https://accounts.google.com',
        providerId: 'google',
      });

      expect(config).toEqual({
        clientId: 'google-client-id',
        clientSecret: 'google-client-secret',
        discoveryUrl: 'https://accounts.google.com/.well-known/openid-configuration',
        pkce: true,
        providerId: 'google',
        scopes: ['openid', 'email', 'profile'],
      });
    });

    it('should handle Azure AD OIDC configuration', () => {
      const config = buildOidcConfig({
        clientId: 'azure-client-id',
        clientSecret: 'azure-client-secret',
        issuer: 'https://login.microsoftonline.com/tenant-id/v2.0',
        providerId: 'azure-ad',
      });

      expect(config.discoveryUrl).toBe(
        'https://login.microsoftonline.com/tenant-id/v2.0/.well-known/openid-configuration',
      );
    });

    it('should handle Keycloak OIDC configuration', () => {
      const config = buildOidcConfig({
        clientId: 'keycloak-client-id',
        clientSecret: 'keycloak-client-secret',
        issuer: 'https://keycloak.example.com/realms/myrealm',
        providerId: 'keycloak',
      });

      expect(config.discoveryUrl).toBe(
        'https://keycloak.example.com/realms/myrealm/.well-known/openid-configuration',
      );
    });
  });
});
