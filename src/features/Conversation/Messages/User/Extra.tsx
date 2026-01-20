import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

import { messageStateSelectors, useConversationStore } from '../../store';
import ExtraContainer from '../components/Extras/ExtraContainer';
import TTS from '../components/Extras/TTS';
import Translate from '../components/Extras/Translate';

const styles = StyleSheet.create({
  spacing: {
    marginTop: 8,
  },
});

interface UserMessageExtraProps {
  content: string;
  extra: any;
  id: string;
}

export const UserMessageExtra = memo<UserMessageExtraProps>(({ extra, id, content }) => {
  const loading = useConversationStore(messageStateSelectors.isMessageGenerating(id));

  const showTranslate = !!extra?.translate;
  const showTTS = !!extra?.tts;

  const showExtra = showTranslate || showTTS;

  if (!showExtra) return;

  return (
    <Flexbox gap={8} style={styles.spacing}>
      {extra?.tts && (
        <ExtraContainer>
          <TTS content={content} id={id} loading={loading} {...extra?.tts} />
        </ExtraContainer>
      )}
      {extra?.translate && (
        <ExtraContainer>
          <Translate id={id} {...extra?.translate} loading={loading} />
        </ExtraContainer>
      )}
    </Flexbox>
  );
});
