import type { AIChatModelCard } from '../types/aiModel';

const openaiCodexChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 192_000,
    description:
      'GPT-5 Codex is a coding-optimized model available through ChatGPT Plus/Pro subscription.',
    displayName: 'GPT-5 Codex',
    enabled: true,
    id: 'gpt-5-codex',
    maxOutput: 16_384,
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 192_000,
    description: 'Codex Mini is a compact and efficient coding model for ChatGPT subscribers.',
    displayName: 'Codex Mini',
    enabled: true,
    id: 'codex-mini',
    maxOutput: 16_384,
    type: 'chat',
  },
];

export const allModels = [...openaiCodexChatModels];

export default allModels;
