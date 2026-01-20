import { Ollama } from '@lobehub/icons';
import { Center } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import FormAction from '@/components/FormAction';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  fullWidth: {
    maxWidth: 300,
    width: '100%',
  },
});

const OllamaDesktopSetupGuide = memo(() => {
  const { t } = useTranslation('components');

  return (
    <Center gap={16} paddingBlock={32} style={styles.fullWidth}>
      <FormAction
        avatar={<Ollama color={cssVar.colorPrimary} size={64} />}
        description={
          <span>
            <Trans
              components={[
                <span key="0" />,
                <a href={'https://ollama.com/download'} key="1" rel="noreferrer" target="_blank" />,
              ]}
              i18nKey={'OllamaSetupGuide.install.description'}
              ns={'components'}
            />
          </span>
        }
        title={t('OllamaSetupGuide.install.title')}
      />
    </Center>
  );
});

export default OllamaDesktopSetupGuide;
