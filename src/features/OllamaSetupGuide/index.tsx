import { isDesktop } from '@lobechat/const';
import { memo } from 'react';

import OllamaSetupGuide from '@/components/OllamaSetupGuide';
import { ErrorActionContainer } from '@/features/Conversation/Error/style';
import { StyleSheet } from '@/utils/styles';

import OllamaDesktopSetupGuide from './Desktop';

const styles = StyleSheet.create({
  spacing: {
    paddingBlock: 0,
  },
});

const SetupGuide = memo<{ container?: boolean }>(({ container = true }) => {
  const content = isDesktop ? <OllamaDesktopSetupGuide /> : <OllamaSetupGuide />;

  if (!container) return content;

  return <ErrorActionContainer style={styles.spacing}>{content}</ErrorActionContainer>;
});

export default SetupGuide;
