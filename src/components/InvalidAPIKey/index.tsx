import { ProviderIcon } from '@lobehub/icons';
import { Button, Center, Flexbox } from '@lobehub/ui';
import { ModelProvider } from 'model-bank';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type GlobalLLMProviderKey } from '@/types/user/settings';
import { StyleSheet } from '@/utils/styles';

import BedrockForm from './Bedrock';
import ComfyUIForm from './ComfyUIForm';
import { LoadingContext } from './LoadingContext';
import ProviderApiKeyForm from './ProviderApiKeyForm';

const styles = StyleSheet.create({
  spacing: {
    marginTop: 8,
  },
});

interface APIKeyFormProps {
  bedrockDescription: string;
  description: string;
  id: string;
  onClose: () => void;
  onRecreate: () => void;
  provider?: string;
}

const APIKeyForm = memo<APIKeyFormProps>(
  ({ provider, description, bedrockDescription, onRecreate, onClose }) => {
    const styleObject = {
      maxWidth: provider === ModelProvider.ComfyUI ? 900 : 300,
      width: provider === ModelProvider.ComfyUI ? '80%' : 'auto',
    };
    const { t } = useTranslation('error');
    const [loading, setLoading] = useState(false);

    const apiKeyPlaceholder = useMemo(() => {
      switch (provider) {
        case ModelProvider.Anthropic: {
          return 'sk-ant_*****************************';
        }

        case ModelProvider.OpenRouter: {
          return 'sk-or-********************************';
        }

        case ModelProvider.Perplexity: {
          return 'pplx-********************************';
        }

        case ModelProvider.ZhiPu: {
          return '*********************.*************';
        }

        case ModelProvider.Groq: {
          return 'gsk_*****************************';
        }

        case ModelProvider.DeepSeek: {
          return 'sk_******************************';
        }

        case ModelProvider.Qwen: {
          return 'sk-********************************';
        }

        case ModelProvider.Github: {
          return 'ghp_*****************************';
        }

        default: {
          return '*********************************';
        }
      }
    }, [provider]);

    return (
      <LoadingContext value={{ loading, setLoading }}>
        <Center gap={16} style={styleObject}>
          {provider === ModelProvider.Bedrock ? (
            <BedrockForm description={bedrockDescription} />
          ) : provider === ModelProvider.ComfyUI ? (
            <ComfyUIForm description={description} />
          ) : (
            <ProviderApiKeyForm
              apiKeyPlaceholder={apiKeyPlaceholder}
              avatar={<ProviderIcon provider={provider} size={80} type={'avatar'} />}
              description={description}
              provider={provider as GlobalLLMProviderKey}
              showEndpoint
            />
          )}
          <Flexbox gap={12} width={'100%'}>
            <Button
              block
              disabled={loading}
              onClick={() => {
                onRecreate();
              }}
              style={styles.spacing}
              type={'primary'}
            >
              {t('unlock.confirm')}
            </Button>
            <Button
              onClick={() => {
                onClose();
              }}
            >
              {t('unlock.closeMessage')}
            </Button>
          </Flexbox>
        </Center>
      </LoadingContext>
    );
  },
);

export default APIKeyForm;
