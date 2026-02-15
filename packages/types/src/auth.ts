export interface ClientSecretPayload {
  /**
   * Represents the user's API key
   *
   * If provider need multi keys like bedrock,
   * this will be used as the checker whether to use frontend key
   */
  apiKey?: string;
  /**
   * ComfyUI specific authentication fields
   */
  authType?: string;

  awsAccessKeyId?: string;

  awsRegion?: string;

  awsSecretAccessKey?: string;
  awsSessionToken?: string;
  azureApiVersion?: string;
  /**
   * Represents the endpoint of provider
   */
  baseURL?: string;

  bearerToken?: string;

  bearerTokenExpiresAt?: number;
  /**
   * OpenAI Codex OAuth fields
   */
  chatgptAccountId?: string;

  cloudflareBaseURLOrAccountID?: string;
  customHeaders?: Record<string, string>;
  oaiDeviceId?: string;
  /**
   * GitHub Copilot OAuth fields
   */
  oauthAccessToken?: string;
  password?: string;

  runtimeProvider?: string;
  /**
   * user id
   * in client db mode it's a uuid
   * in server db mode it's a user id
   */
  userId?: string;
  username?: string;

  vertexAIRegion?: string;
}
