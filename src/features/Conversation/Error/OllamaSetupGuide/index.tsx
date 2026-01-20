import { Block } from '@lobehub/ui';
import { memo } from 'react';

import OllamaSetupGuide from '@/components/OllamaSetupGuide';
import { isDesktop } from '@/const/version';
import { StyleSheet } from '@/utils/styles';

import OllamaDesktopSetupGuide from './Desktop';

const styles = StyleSheet.create({
  fullWidth: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
});

const SetupGuide = memo<{ id?: string }>(({ id }) => {
  return (
    <Block align={'center'} gap={8} padding={16} style={styles.fullWidth} variant={'outlined'}>
      {isDesktop ? <OllamaDesktopSetupGuide id={id} /> : <OllamaSetupGuide />}
    </Block>
  );
});

export default SetupGuide;
