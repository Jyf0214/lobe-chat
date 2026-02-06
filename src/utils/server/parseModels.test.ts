import { LOBE_DEFAULT_MODEL_LIST, openaiChatModels } from 'model-bank';
import { AiFullModelCard } from 'model-bank';
import { describe, expect, it } from 'vitest';

import { extractEnabledModels, parseModelString, transformToAiModelList } from './parseModels';

describe('parseModelString', () => {
  it('custom deletion, addition, and renaming of models', async () => {
    const result = await parseModelString(
      'test-provider',
      '-all,+llama,+claude-2，-gpt-3.5-turbo,gpt-4-1106-preview=gpt-4-turbo,gpt-4-1106-preview=gpt-4-32k',
    );

    expect(result).toMatchSnapshot();
  });

  it('duplicate naming model', async () => {
    const result = await parseModelString(
      'test-provider',
      'gpt-4-1106-preview=gpt-4-turbo，gpt-4-1106-preview=gpt-4-32k',
    );
    expect(result).toMatchSnapshot();
  });

  it('only add the model', async () => {
    const result = await parseModelString('test-provider', 'model1,model2,model3，model4');

    expect(result).toMatchSnapshot();
  });

  it('empty string model', async () => {
    const result = await parseModelString(
      'test-provider',
      'gpt-4-1106-preview=gpt-4-turbo,,  ,\n  ，+claude-2',
    );
    expect(result).toMatchSnapshot();
  });

  describe('extension capabilities', () => {
    it('with token', async () => {
      const result = await parseModelString('test-provider', 'chatglm-6b=ChatGLM 6B<4096>');

      expect(result.add[0]).toEqual({
        displayName: 'ChatGLM 6B',
        id: 'chatglm-6b',
        contextWindowTokens: 4096,
        abilities: {},
        type: 'chat',
      });
    });

    it('token and function calling', async () => {
      const result = await parseModelString('test-provider', 'spark-v3.5=讯飞星火 v3.5<8192:fc>');

      expect(result.add[0]).toEqual({
        displayName: '讯飞星火 v3.5',
        abilities: {
          functionCall: true,
        },
        id: 'spark-v3.5',
        contextWindowTokens: 8192,
        type: 'chat',
      });
    });

    it('token and reasoning', async () => {
      const result = await parseModelString(
        'test-provider',
        'deepseek-r1=Deepseek R1<65536:reasoning>',
      );

      expect(result.add[0]).toEqual({
        displayName: 'Deepseek R1',
        abilities: {
          reasoning: true,
        },
        id: 'deepseek-r1',
        contextWindowTokens: 65_536,
        type: 'chat',
      });
    });

    it('token and search', async () => {
      const result = await parseModelString(
        'test-provider',
        'qwen-max-latest=Qwen Max<32768:search>',
      );

      expect(result.add[0]).toEqual({
        displayName: 'Qwen Max',
        abilities: {
          search: true,
        },
        id: 'qwen-max-latest',
        contextWindowTokens: 32_768,
        type: 'chat',
      });
    });

    it('token and image output', async () => {
      const result = await parseModelString(
        'test-provider',
        'gemini-2.0-flash-exp-image-generation=Gemini 2.0 Flash (Image Generation) Experimental<32768:imageOutput>',
      );

      expect(result.add[0]).toEqual({
        displayName: 'Gemini 2.0 Flash (Image Generation) Experimental',
        abilities: {
          imageOutput: true,
        },
        id: 'gemini-2.0-flash-exp-image-generation',
        contextWindowTokens: 32_768,
        type: 'chat',
      });
    });

    it('multi models', async () => {
      const result = await parseModelString(
        'test-provider',
        'gemini-1.5-flash-latest=Gemini 1.5 Flash<16000:vision>,gpt-4-all=ChatGPT Plus<128000:fc:vision:file>',
      );

      expect(result.add).toEqual([
        {
          displayName: 'Gemini 1.5 Flash',
          abilities: {
            vision: true,
          },
          id: 'gemini-1.5-flash-latest',
          contextWindowTokens: 16000,
          type: 'chat',
        },
        {
          displayName: 'ChatGPT Plus',
          abilities: {
            vision: true,
            functionCall: true,
            files: true,
          },
          type: 'chat',
          id: 'gpt-4-all',
          contextWindowTokens: 128000,
        },
      ]);
    });

    it('should have file with builtin models like gpt-4-0125-preview', async () => {
      const result = await parseModelString(
        'openai',
        '-all,+gpt-4-0125-preview=ChatGPT-4<128000:fc:file>,+gpt-4-turbo-2024-04-09=ChatGPT-4 Vision<128000:fc:vision:file>',
      );
      expect(result.add).toEqual([
        {
          displayName: 'ChatGPT-4',
          abilities: {
            functionCall: true,
            files: true,
          },
          type: 'chat',
          id: 'gpt-4-0125-preview',
          contextWindowTokens: 128000,
        },
        {
          displayName: 'ChatGPT-4 Vision',
          abilities: {
            functionCall: true,
            files: true,
            vision: true,
          },
          type: 'chat',
          id: 'gpt-4-turbo-2024-04-09',
          contextWindowTokens: 128000,
        },
      ]);
    });

    it('should handle empty extension capability value', async () => {
      const result = await parseModelString('test-provider', 'model1<1024:>');
      expect(result.add[0]).toEqual({
        abilities: {},
        type: 'chat',
        id: 'model1',
        contextWindowTokens: 1024,
      });
    });

    it('should handle empty extension capability name', async () => {
      const result = await parseModelString('test-provider', 'model1<1024::file>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {
          files: true,
        },
        type: 'chat',
      });
    });

    it('should handle duplicate extension capabilities', async () => {
      const result = await parseModelString('test-provider', 'model1<1024:vision:vision>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {
          vision: true,
        },
        type: 'chat',
      });
    });

    it('should handle case-sensitive extension capability names', async () => {
      const result = await parseModelString('test-provider', 'model1<1024:VISION:FC:file>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {
          files: true,
        },
        type: 'chat',
      });
    });

    it('should handle case-sensitive extension capability values', async () => {
      const result = await parseModelString('test-provider', 'model1<1024:vision:Fc:File>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {
          vision: true,
        },
        type: 'chat',
      });
    });

    it('should handle empty angle brackets', async () => {
      const result = await parseModelString('test-provider', 'model1<>');
      expect(result.add[0]).toEqual({ id: 'model1', abilities: {}, type: 'chat' });
    });

    it('should handle not close angle brackets', async () => {
      const result = await parseModelString('test-provider', 'model1<,model2');
      expect(result.add).toEqual([
        { id: 'model1', abilities: {}, type: 'chat' },
        { id: 'model2', abilities: {}, type: 'chat' },
      ]);
    });

    it('should handle multi close angle brackets', async () => {
      const result = await parseModelString('test-provider', 'model1<>>,model2');
      expect(result.add).toEqual([
        { id: 'model1', abilities: {}, type: 'chat' },
        { id: 'model2', abilities: {}, type: 'chat' },
      ]);
    });

    it('should handle only colon inside angle brackets', async () => {
      const result = await parseModelString('test-provider', 'model1<:>');
      expect(result.add[0]).toEqual({ id: 'model1', abilities: {}, type: 'chat' });
    });

    it('should handle only non-digit characters inside angle brackets', async () => {
      const result = await parseModelString('test-provider', 'model1<abc>');
      expect(result.add[0]).toEqual({ id: 'model1', abilities: {}, type: 'chat' });
    });

    it('should handle non-digit characters followed by digits inside angle brackets', async () => {
      const result = await parseModelString('test-provider', 'model1<abc123>');
      expect(result.add[0]).toEqual({ id: 'model1', abilities: {}, type: 'chat' });
    });

    it('should handle digits followed by non-colon characters inside angle brackets', async () => {
      const result = await parseModelString('test-provider', 'model1<1024abc>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {},
        type: 'chat',
      });
    });

    it('should handle digits followed by multiple colons inside angle brackets', async () => {
      const result = await parseModelString('test-provider', 'model1<1024::>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {},
        type: 'chat',
      });
    });

    it('should handle digits followed by a colon and non-letter characters inside angle brackets', async () => {
      const result = await parseModelString('test-provider', 'model1<1024:123>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {},
        type: 'chat',
      });
    });

    it('should handle digits followed by a colon and spaces inside angle brackets', async () => {
      const result = await parseModelString('test-provider', 'model1<1024: vision>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {},
        type: 'chat',
      });
    });

    it('should handle digits followed by multiple colons and spaces inside angle brackets', async () => {
      const result = await parseModelString('test-provider', 'model1<1024: : vision>');
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 1024,
        abilities: {},
        type: 'chat',
      });
    });

    it('should handle video capability', async () => {
      const result = await parseModelString(
        'test-provider',
        'gemini-2.0-flash=Gemini 2.0 Flash<32768:video>',
      );
      expect(result.add[0]).toEqual({
        displayName: 'Gemini 2.0 Flash',
        abilities: {
          video: true,
        },
        id: 'gemini-2.0-flash',
        contextWindowTokens: 32_768,
        type: 'chat',
      });
    });

    it('should handle mixed capabilities including video', async () => {
      const result = await parseModelString(
        'test-provider',
        'gemini-2.0-flash=Gemini 2.0<32768:vision:video:fc>',
      );
      expect(result.add[0]).toEqual({
        displayName: 'Gemini 2.0',
        abilities: {
          vision: true,
          video: true,
          functionCall: true,
        },
        id: 'gemini-2.0-flash',
        contextWindowTokens: 32_768,
        type: 'chat',
      });
    });

    it('should warn on unknown capability', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await parseModelString('test-provider', 'model1<1024:unknownCapability>');
      expect(consoleSpy).toHaveBeenCalledWith('Unknown capability: unknownCapability');
      consoleSpy.mockRestore();
    });

    it('should handle multiple unknown capabilities', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await parseModelString('test-provider', 'model1<1024:invalid1:vision:invalid2>');
      expect(consoleSpy).toHaveBeenCalledWith('Unknown capability: invalid1');
      expect(consoleSpy).toHaveBeenCalledWith('Unknown capability: invalid2');
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      consoleSpy.mockRestore();
    });

    it('should handle all supported capabilities at once', async () => {
      const result = await parseModelString(
        'test-provider',
        'model1<128000:reasoning:vision:fc:file:video:search:imageOutput>',
      );
      expect(result.add[0]).toEqual({
        id: 'model1',
        contextWindowTokens: 128000,
        abilities: {
          reasoning: true,
          vision: true,
          functionCall: true,
          files: true,
          video: true,
          search: true,
          imageOutput: true,
        },
        type: 'chat',
      });
    });
  });

  describe('FAL image models', () => {
    it('should correctly parse FAL image model ids with slash and custom display names', async () => {
      const result = await parseModelString(
        'fal',
        '-all,+fal-ai/flux-kontext/dev=KontextDev,+fal-ai/flux-pro/kontext=KontextPro,+fal-ai/flux/schnell=Schnell,+fal-ai/imagen4/preview=Imagen4',
      );
      expect(result.add).toEqual([
        {
          id: 'fal-ai/flux-kontext/dev',
          displayName: 'KontextDev',
          abilities: {},
          type: 'image',
        },
        {
          id: 'fal-ai/flux-pro/kontext',
          displayName: 'KontextPro',
          abilities: {},
          type: 'image',
        },
        {
          id: 'fal-ai/flux/schnell',
          displayName: 'Schnell',
          abilities: {},
          type: 'image',
        },
        {
          id: 'fal-ai/imagen4/preview',
          displayName: 'Imagen4',
          abilities: {},
          type: 'image',
        },
      ]);
      expect(result.removeAll).toBe(true);
      expect(result.removed).toEqual(['all']);
    });

    it('should correctly parse FAL image model ids with slash (no displayName)', async () => {
      const result = await parseModelString(
        'fal',
        '-all,+fal-ai/flux-kontext/dev,+fal-ai/flux-pro/kontext',
      );
      expect(result.add).toEqual([
        {
          id: 'fal-ai/flux-kontext/dev',
          abilities: {},
          type: 'image',
        },
        {
          id: 'fal-ai/flux-pro/kontext',
          abilities: {},
          type: 'image',
        },
      ]);
      expect(result.removeAll).toBe(true);
      expect(result.removed).toEqual(['all']);
    });
  });

  describe('deployment name', () => {
    it('should have no deployment name', async () => {
      const result = await parseModelString('test-provider', 'model1=Model 1', true);
      expect(result.add[0]).toEqual({
        id: 'model1',
        displayName: 'Model 1',
        abilities: {},
        type: 'chat',
      });
    });

    it('should have diff deployment name as id', async () => {
      const result = await parseModelString('azure', 'gpt-35-turbo->my-deploy=GPT 3.5 Turbo', true);
      expect(result.add[0]).toEqual({
        id: 'gpt-35-turbo',
        displayName: 'GPT 3.5 Turbo',
        abilities: {},
        type: 'chat',
        config: {
          deploymentName: 'my-deploy',
        },
      });
    });

    it('should handle with multi deployName', async () => {
      const result = await parseModelString(
        'azure',
        'gpt-4o->id1=GPT-4o,gpt-4o-mini->id2=gpt-4o-mini,o1-mini->id3=O1 mini',
        true,
      );
      expect(result.add).toEqual([
        {
          abilities: {},
          displayName: 'GPT-4o',
          id: 'gpt-4o',
          type: 'chat',
          config: { deploymentName: 'id1' },
        },
        {
          abilities: {},
          displayName: 'gpt-4o-mini',
          id: 'gpt-4o-mini',
          type: 'chat',
          config: { deploymentName: 'id2' },
        },
        {
          abilities: {},
          displayName: 'O1 mini',
          id: 'o1-mini',
          type: 'chat',
          config: { deploymentName: 'id3' },
        },
      ]);
    });

    it('should handle deployment name with capabilities', async () => {
      const result = await parseModelString(
        'azure',
        'gpt-4o->my-deploy=GPT-4o<128000:vision:fc>',
        true,
      );
      expect(result.add[0]).toEqual({
        id: 'gpt-4o',
        displayName: 'GPT-4o',
        abilities: {
          vision: true,
          functionCall: true,
        },
        contextWindowTokens: 128000,
        type: 'chat',
        config: {
          deploymentName: 'my-deploy',
        },
      });
    });

    it('should handle deployment name with special characters', async () => {
      const result = await parseModelString('azure', 'gpt-4o->my-deploy_v1.2=GPT-4o', true);
      expect(result.add[0]).toEqual({
        id: 'gpt-4o',
        displayName: 'GPT-4o',
        abilities: {},
        type: 'chat',
        config: {
          deploymentName: 'my-deploy_v1.2',
        },
      });
    });

    it('should handle removeAll with deployment names', async () => {
      const result = await parseModelString('azure', '-all,+gpt-4o->my-deploy=GPT-4o', true);
      expect(result.removeAll).toBe(true);
      expect(result.removed).toEqual(['all']);
      expect(result.add[0]).toEqual({
        id: 'gpt-4o',
        displayName: 'GPT-4o',
        abilities: {},
        type: 'chat',
        config: {
          deploymentName: 'my-deploy',
        },
      });
    });
  });

  describe('security and edge cases', () => {
    it('should handle very long model names', async () => {
      const longModelName = 'a'.repeat(500);
      const result = await parseModelString('test-provider', longModelName);
      expect(result.add[0].id).toBe(longModelName);
    });

    it('should handle very long display names', async () => {
      const longDisplayName = 'b'.repeat(500);
      const result = await parseModelString('test-provider', `model=${longDisplayName}`);
      expect(result.add[0].displayName).toBe(longDisplayName);
    });

    it('should handle extremely large token values', async () => {
      const result = await parseModelString('test-provider', 'model<999999999999>');
      expect(result.add[0].contextWindowTokens).toBe(999_999_999_999);
    });

    it('should handle negative token values gracefully', async () => {
      const result = await parseModelString('test-provider', 'model<-1024>');
      expect(result.add[0].contextWindowTokens).toBe(-1024);
    });

    it('should handle models with only whitespace in display name', async () => {
      const result = await parseModelString('test-provider', 'model=   ');
      expect(result.add[0]).toEqual({
        id: 'model',
        displayName: '   ',
        abilities: {},
        type: 'chat',
      });
    });

    it('should handle multiple consecutive commas', async () => {
      const result = await parseModelString('test-provider', 'model1,,,,,model2');
      expect(result.add).toHaveLength(2);
      expect(result.add[0].id).toBe('model1');
      expect(result.add[1].id).toBe('model2');
    });

    it('should handle Chinese comma mixed with English comma', async () => {
      const result = await parseModelString('test-provider', 'model1，model2,model3，model4');
      expect(result.add).toHaveLength(4);
    });

    it('should handle model names with special characters', async () => {
      const result = await parseModelString('test-provider', 'model-v1.2_beta@2024');
      expect(result.add[0].id).toBe('model-v1.2_beta@2024');
    });

    it('should handle equal signs in display name', async () => {
      const result = await parseModelString('test-provider', 'model=GPT=4=Turbo');
      // The split('=') only uses the first two parts: id and displayName
      expect(result.add[0]).toEqual({
        id: 'model',
        displayName: 'GPT',
        abilities: {},
        type: 'chat',
      });
    });

    it('should handle arrow in model id when withDeploymentName is false', async () => {
      const result = await parseModelString('test-provider', 'model->deploy=Display', false);
      expect(result.add[0]).toEqual({
        id: 'model->deploy',
        displayName: 'Display',
        abilities: {},
        type: 'chat',
      });
    });

    it('should handle empty model string after splitting', async () => {
      const result = await parseModelString('test-provider', ',,,');
      expect(result.add).toHaveLength(0);
      expect(result.removed).toHaveLength(0);
      expect(result.removeAll).toBe(false);
    });
  });
});

describe('extractEnabledModels', () => {
  it('should return undefined when no models are added', async () => {
    const result = await extractEnabledModels('test-provider', '-all');
    expect(result).toBeUndefined();
  });

  it('should return undefined when modelString is empty', async () => {
    const result = await extractEnabledModels('test-provider', '');
    expect(result).toBeUndefined();
  });

  it('should return array of model IDs when models are added', async () => {
    const result = await extractEnabledModels('test-provider', '+model1,+model2,+model3');
    expect(result).toEqual(['model1', 'model2', 'model3']);
  });

  it('should handle mixed add/remove operations and return only added models', async () => {
    const result = await extractEnabledModels('test-provider', '+model1,-model2,+model3');
    expect(result).toEqual(['model1', 'model3']);
  });

  it('should handle deployment names when withDeploymentName is true', async () => {
    const result = await extractEnabledModels(
      'azure',
      '+gpt-4->deployment1,+gpt-35-turbo->deployment2',
      true,
    );
    expect(result).toEqual(['gpt-4', 'gpt-35-turbo']);
  });

  it('should handle complex model strings with custom names', async () => {
    const result = await extractEnabledModels(
      'openai',
      '+gpt-4=Custom GPT-4,+claude-2=Custom Claude',
    );
    expect(result).toEqual(['gpt-4', 'claude-2']);
  });

  it('should handle model strings with capabilities', async () => {
    const result = await extractEnabledModels(
      'openai',
      '+gpt-4=GPT-4<128000:vision:fc>,+claude-2<100000>',
    );
    expect(result).toEqual(['gpt-4', 'claude-2']);
  });

  it('should return undefined for default modelString parameter', async () => {
    const result = await extractEnabledModels('test-provider');
    expect(result).toBeUndefined();
  });

  it('should handle only removal operations', async () => {
    const result = await extractEnabledModels('test-provider', '-model1,-model2');
    expect(result).toBeUndefined();
  });

  it('should handle duplicate model IDs', async () => {
    const result = await extractEnabledModels('test-provider', '+model1,+model1,+model2,+model1');
    // Due to deduplication in parseModelString, the last model1 wins and is placed at the end
    expect(result).toEqual(['model2', 'model1']);
  });

  it('should handle whitespace and empty entries', async () => {
    const result = await extractEnabledModels('test-provider', '+model1,  ,+model2,,+model3');
    expect(result).toEqual(['model1', 'model2', 'model3']);
  });

  it('should handle deployment names with capabilities', async () => {
    const result = await extractEnabledModels(
      'azure',
      '+gpt-4->deploy1=GPT-4<128000:fc>,+gpt-35-turbo->deploy2',
      true,
    );
    expect(result).toEqual(['gpt-4', 'gpt-35-turbo']);
  });

  it('should return undefined when only removeAll is specified', async () => {
    const result = await extractEnabledModels('test-provider', '-all');
    expect(result).toBeUndefined();
  });

  it('should handle models added after removeAll', async () => {
    const result = await extractEnabledModels('test-provider', '-all,+model1,+model2');
    expect(result).toEqual(['model1', 'model2']);
  });
});

describe('transformToChatModelCards', () => {
  const defaultChatModels: AiFullModelCard[] = [
    { id: 'model1', displayName: 'Model 1', enabled: true, type: 'chat' },
    { id: 'model2', displayName: 'Model 2', enabled: false, type: 'chat' },
  ];

  it('should return undefined when modelString is empty', async () => {
    const result = await transformToAiModelList({
      modelString: '',
      defaultModels: defaultChatModels,
      providerId: 'openai',
    });
    expect(result).toBeUndefined();
  });

  it('should remove all models when removeAll is true', async () => {
    const result = await transformToAiModelList({
      modelString: '-all',
      defaultModels: defaultChatModels,
      providerId: 'openai',
    });
    expect(result).toEqual([]);
  });

  it('should remove specified models', async () => {
    const result = await transformToAiModelList({
      modelString: '-model1',
      defaultModels: defaultChatModels,
      providerId: 'openai',
    });
    expect(result).toEqual([
      { id: 'model2', displayName: 'Model 2', enabled: false, type: 'chat' },
    ]);
  });

  it('should add a new known model', async () => {
    const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => m.providerId === 'ai21')!;
    const result = await transformToAiModelList({
      modelString: `${knownModel.id}`,
      defaultModels: defaultChatModels,
      providerId: 'ai21',
    });

    expect(result).toContainEqual({
      ...knownModel,
      displayName: knownModel.displayName || knownModel.id,
      enabled: true,
    });
  });

  it('should update an existing known model', async () => {
    const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => m.providerId === 'openai')!;
    const result = await transformToAiModelList({
      modelString: `+${knownModel.id}=Updated Model`,
      defaultModels: [knownModel],
      providerId: 'openai',
    });

    expect(result).toContainEqual({
      ...knownModel,
      displayName: 'Updated Model',
      enabled: true,
    });
  });

  it('should add a new custom model', async () => {
    const result = await transformToAiModelList({
      modelString: '+custom_model=Custom Model',
      defaultModels: defaultChatModels,
      providerId: 'openai',
    });
    expect(result).toContainEqual({
      id: 'custom_model',
      displayName: 'Custom Model',
      enabled: true,
      abilities: {},
      type: 'chat',
    });
  });

  it('should have file with builtin models like gpt-4-0125-preview', async () => {
    const result = await transformToAiModelList({
      modelString:
        '-all,+gpt-4-0125-preview=ChatGPT-4<128000:fc:file>,+gpt-4-turbo-2024-04-09=ChatGPT-4 Vision<128000:fc:vision:file>',
      defaultModels: openaiChatModels,
      providerId: 'openai',
    });

    expect(result).toMatchSnapshot();
  });

  it('should use default deploymentName from known model when not specified in string (VolcEngine case)', async () => {
    const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
      (m) => m.id === 'deepseek-r1' && m.providerId === 'volcengine',
    );
    const defaultChatModels: AiFullModelCard[] = [];
    const result = await transformToAiModelList({
      modelString: '+deepseek-r1',
      defaultModels: defaultChatModels,
      providerId: 'volcengine',
      withDeploymentName: true,
    });
    expect(result).toContainEqual({
      ...knownModel,
      enabled: true,
    });
  });

  it('should use deploymentName from modelString when specified (VolcEngine case)', async () => {
    const defaultChatModels: AiFullModelCard[] = [];
    const knownModel = LOBE_DEFAULT_MODEL_LIST.find(
      (m) => m.id === 'deepseek-r1' && m.providerId === 'volcengine',
    );
    const result = await transformToAiModelList({
      modelString: `+deepseek-r1->my-custom-deploy`,
      defaultModels: defaultChatModels,
      providerId: 'volcengine',
      withDeploymentName: true,
    });
    expect(result).toContainEqual({
      ...knownModel,
      enabled: true,
      config: { deploymentName: 'my-custom-deploy' },
    });
  });

  it('should set both id and deploymentName to the full string when no -> is used and withDeploymentName is true', async () => {
    const defaultChatModels: AiFullModelCard[] = [];
    const result = await transformToAiModelList({
      modelString: `+my_model`,
      defaultModels: defaultChatModels,
      providerId: 'volcengine',
      withDeploymentName: true,
    });
    expect(result).toContainEqual({
      id: `my_model`,
      displayName: `my_model`,
      type: 'chat',
      abilities: {},
      enabled: true,
      config: {
        deploymentName: `my_model`,
      },
    });
  });

  it('should handle azure real case', async () => {
    const defaultChatModels = [
      {
        abilities: { functionCall: true, reasoning: true },
        config: { deploymentName: 'o3-mini' },
        contextWindowTokens: 200000,
        description:
          'o3-mini 是我们最新的小型推理模型，在与 o1-mini 相同的成本和延迟目标下提供高智能。',
        displayName: 'OpenAI o3-mini',
        id: 'o3-mini',
        maxOutput: 100000,
        pricing: { input: 1.1, output: 4.4 },
        releasedAt: '2025-01-31',
        type: 'chat',
      },
      {
        abilities: { reasoning: true },
        config: { deploymentName: 'o1-mini' },
        contextWindowTokens: 128000,
        description:
          'o1-mini is a fast, cost-effective reasoning model designed for programming, math, and science use cases. It has a 128K context window and an October 2023 knowledge cutoff.',
        displayName: 'OpenAI o1-mini',
        enabled: true,
        id: 'o1-mini',
        maxOutput: 65536,
        pricing: { input: 1.1, output: 4.4 },
        releasedAt: '2024-09-12',
        type: 'chat',
      },
      {
        abilities: { reasoning: true },
        config: { deploymentName: 'o1' },
        contextWindowTokens: 200000,
        description:
          'o1是OpenAI新的推理模型，支持图文输入并输出文本，适用于需要广泛通用知识的复杂任务。该模型具有200K上下文和2023年10月的知识截止日期。',
        displayName: 'OpenAI o1',
        enabled: true,
        id: 'o1',
        maxOutput: 100000,
        pricing: { input: 15, output: 60 },
        releasedAt: '2024-12-17',
        type: 'chat',
      },
      {
        abilities: { reasoning: true },
        config: { deploymentName: 'o1-preview' },
        contextWindowTokens: 128000,
        description:
          'o1是OpenAI新的推理模型，适用于需要广泛通用知识的复杂任务。该模型具有128K上下文和2023年10月的知识截止日期。',
        displayName: 'OpenAI o1-preview',
        id: 'o1-preview',
        maxOutput: 32768,
        pricing: { input: 15, output: 60 },
        releasedAt: '2024-09-12',
        type: 'chat',
      },
      {
        abilities: { functionCall: true, vision: true },
        config: { deploymentName: 'gpt-4o' },
        contextWindowTokens: 128000,
        description:
          'ChatGPT-4o is a dynamic model that updates in real time to stay current. It combines strong language understanding and generation, suitable for large-scale applications such as customer support, education, and technical support.',
        displayName: 'GPT-4o',
        enabled: true,
        id: 'gpt-4o',
        pricing: { input: 2.5, output: 10 },
        releasedAt: '2024-05-13',
        type: 'chat',
      },
      {
        abilities: { functionCall: true, vision: true },
        config: { deploymentName: 'gpt-4-turbo' },
        contextWindowTokens: 128000,
        description: 'GPT 4 Turbo，多模态模型，提供杰出的语言理解和生成能力，同时支持图像输入。',
        displayName: 'GPT 4 Turbo',
        id: 'gpt-4',
        maxOutput: 4096,
        type: 'chat',
      },
      {
        abilities: { functionCall: true, vision: true },
        config: { deploymentName: 'gpt-4o-mini' },
        contextWindowTokens: 128000,
        description: 'GPT-4o Mini is a small, efficient model with performance similar to GPT-4o.',
        displayName: 'GPT 4o Mini',
        enabled: true,
        id: 'gpt-4o-mini',
        maxOutput: 4096,
        type: 'chat',
      },
    ] as AiFullModelCard[];

    const modelString =
      '-all,gpt-4o->id1=GPT-4o,gpt-4o-mini->id2=GPT 4o Mini,o1-mini->id3=OpenAI o1-mini';

    const data = await transformToAiModelList({
      modelString,
      defaultModels: defaultChatModels,
      providerId: 'azure',
      withDeploymentName: true,
    });

    expect(data).toEqual([
      {
        abilities: { functionCall: true, vision: true },
        config: { deploymentName: 'id1' },
        contextWindowTokens: 128000,
        description:
          'ChatGPT-4o is a dynamic model that updates in real time to stay current. It combines strong language understanding and generation, suitable for large-scale applications such as customer support, education, and technical support.',
        displayName: 'GPT-4o',
        enabled: true,
        id: 'gpt-4o',
        maxOutput: 4096,
        pricing: {
          units: [
            {
              name: 'textInput_cacheRead',
              rate: 1.25,
              strategy: 'fixed',
              unit: 'millionTokens',
            },
            {
              name: 'textInput',
              rate: 2.5,
              strategy: 'fixed',
              unit: 'millionTokens',
            },
            {
              name: 'textOutput',
              rate: 10,
              strategy: 'fixed',
              unit: 'millionTokens',
            },
          ],
        },
        providerId: 'azure',
        releasedAt: '2024-05-13',
        source: 'builtin',
        type: 'chat',
      },
      {
        abilities: { functionCall: true, vision: true },
        config: { deploymentName: 'id2' },
        contextWindowTokens: 128000,
        description: 'GPT-4o Mini is a small, efficient model with performance similar to GPT-4o.',
        displayName: 'GPT 4o Mini',
        providerId: 'azure',
        source: 'builtin',
        enabled: true,
        id: 'gpt-4o-mini',
        maxOutput: 4096,
        pricing: {
          units: [
            {
              name: 'textInput_cacheRead',
              rate: 0.075,
              strategy: 'fixed',
              unit: 'millionTokens',
            },
            {
              name: 'textInput',
              rate: 0.15,
              strategy: 'fixed',
              unit: 'millionTokens',
            },
            {
              name: 'textOutput',
              rate: 0.6,
              strategy: 'fixed',
              unit: 'millionTokens',
            },
          ],
        },
        type: 'chat',
      },
      {
        abilities: { reasoning: true },
        config: { deploymentName: 'id3' },
        contextWindowTokens: 128000,
        description:
          'o1-mini is a fast, cost-effective reasoning model designed for programming, math, and science use cases. It has a 128K context window and an October 2023 knowledge cutoff.',
        displayName: 'OpenAI o1-mini',
        enabled: true,
        providerId: 'azure',
        source: 'builtin',
        id: 'o1-mini',
        maxOutput: 65536,
        pricing: {
          units: [
            {
              name: 'textInput_cacheRead',
              rate: 0.55,
              strategy: 'fixed',
              unit: 'millionTokens',
            },
            {
              name: 'textInput',
              rate: 1.1,
              strategy: 'fixed',
              unit: 'millionTokens',
            },
            {
              name: 'textOutput',
              rate: 4.4,
              strategy: 'fixed',
              unit: 'millionTokens',
            },
          ],
        },
        releasedAt: '2024-09-12',
        type: 'chat',
      },
    ]);
  });

  it('should handle removing specific model then re-adding it with custom name', async () => {
    const defaultChatModels: AiFullModelCard[] = [
      { id: 'model1', displayName: 'Model 1', enabled: true, type: 'chat' },
      { id: 'model2', displayName: 'Model 2', enabled: true, type: 'chat' },
    ];
    const result = await transformToAiModelList({
      modelString: '-model1,+model1=Custom Model 1',
      defaultModels: defaultChatModels,
      providerId: 'openai',
    });
    expect(result).toContainEqual({
      id: 'model1',
      displayName: 'Custom Model 1',
      enabled: true,
      abilities: {},
      type: 'chat',
    });
  });

  it('should handle abilities merging correctly', async () => {
    const defaultChatModels: AiFullModelCard[] = [
      {
        id: 'model1',
        displayName: 'Model 1',
        enabled: false,
        type: 'chat',
        abilities: { vision: true },
      },
    ];
    const result = await transformToAiModelList({
      modelString: '+model1<8192:fc>',
      defaultModels: defaultChatModels,
      providerId: 'openai',
    });
    // Merge operation preserves existing abilities and adds new ones from parsed model
    expect(result?.[0].abilities).toEqual({
      vision: true,
    });
  });

  it('should preserve original displayName when adding model without custom name', async () => {
    const knownModel = LOBE_DEFAULT_MODEL_LIST.find((m) => m.providerId === 'openai')!;
    const result = await transformToAiModelList({
      modelString: `+${knownModel.id}`,
      defaultModels: [],
      providerId: 'openai',
    });
    expect(result?.[0].displayName).toBe(knownModel.displayName || knownModel.id);
  });

  it('should handle complex real-world scenario with multiple operations', async () => {
    const defaultChatModels: AiFullModelCard[] = [
      { id: 'model1', displayName: 'Model 1', enabled: true, type: 'chat' },
      { id: 'model2', displayName: 'Model 2', enabled: false, type: 'chat' },
      { id: 'model3', displayName: 'Model 3', enabled: true, type: 'chat' },
    ];
    const result = await transformToAiModelList({
      modelString: '-model2,+model4=New Model<4096:vision>',
      defaultModels: defaultChatModels,
      providerId: 'openai',
    });
    // model2 should be removed
    expect(result?.find((m) => m.id === 'model2')).toBeUndefined();
    // model3 should remain
    expect(result?.find((m) => m.id === 'model3')).toBeDefined();
    // model1 should remain unchanged
    expect(result?.find((m) => m.id === 'model1')).toBeDefined();
    // model4 should be added
    const model4 = result?.find((m) => m.id === 'model4');
    expect(model4).toBeDefined();
    expect(model4?.displayName).toBe('New Model');
    expect(model4?.abilities?.vision).toBe(true);
  });

  it('should return undefined for undefined modelString', async () => {
    const result = await transformToAiModelList({
      modelString: undefined,
      defaultModels: [],
      providerId: 'openai',
    });
    expect(result).toBeUndefined();
  });

  it('should handle withDeploymentName for custom models not in known list', async () => {
    const result = await transformToAiModelList({
      modelString: '+custom-model->my-deployment=Custom Model',
      defaultModels: [],
      providerId: 'custom-provider',
      withDeploymentName: true,
    });
    expect(result?.[0]).toEqual({
      id: 'custom-model',
      displayName: 'Custom Model',
      enabled: true,
      abilities: {},
      type: 'chat',
      config: {
        deploymentName: 'my-deployment',
      },
    });
  });
});
