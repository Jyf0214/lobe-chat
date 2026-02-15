import type { ModelProviderCard } from '@/types/llm';

const OpenAICodex: ModelProviderCard = {
  chatModels: [],
  checkModel: 'gpt-5-codex',
  description: 'Access OpenAI Codex models through your ChatGPT Plus/Pro subscription.',
  id: 'openaicodex',
  name: 'OpenAI Codex',
  settings: {
    authType: 'oauthDeviceFlow',
    oauthDeviceFlow: {
      clientId: 'app_EMoamEEZ73f0CkXaXp7hrann',
      defaultPollingInterval: 5,
      deviceCodeEndpoint: 'https://auth0.openai.com/oauth/device/code',
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      tokenEndpoint: 'https://auth0.openai.com/oauth/token',
    },
    showApiKey: false,
    showChecker: true,
    showModelFetcher: false,
  },
  url: 'https://openai.com/codex/',
};

export default OpenAICodex;
