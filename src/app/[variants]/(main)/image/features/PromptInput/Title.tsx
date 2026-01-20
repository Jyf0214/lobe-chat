'use client';

import { Center, Icon, Text } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  colored: {
    backgroundColor: cssVar.colorText,
    borderRadius: 16,
  },
  fullWidth: {
    width: '100%',
  },
  spacing: {
    margin: 0,
  },
});

const PromptTitle = () => {
  const { t } = useTranslation('image');

  return (
    <Center gap={16} horizontal style={styles.fullWidth}>
      <Center flex={'none'} height={54} style={styles.colored} width={54}>
        <Icon color={cssVar.colorBgLayout} icon={Palette} size={32} />
      </Center>
      <Text as={'h1'} style={styles.spacing}>
        {t('config.header.title')}
      </Text>
    </Center>
  );
};

export default PromptTitle;
