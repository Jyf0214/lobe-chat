import { ActionIcon, Flexbox } from '@lobehub/ui';
import { ChatHeader } from '@lobehub/ui/mobile';
import { cssVar } from 'antd-style';
import { ChevronDown } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  colored: {
    background: cssVar.colorFillSecondary,
    color: cssVar.colorTextDescription,
  },
  spacing: {
    marginRight: '8px',
    maxWidth: '64vw',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  style: {
    maxWidth: '60vw',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

const ChatHeaderTitle = memo(() => {
  const { t } = useTranslation(['chat', 'topic']);
  const toggleConfig = useGlobalStore((s) => s.toggleMobileTopic);
  const [topicLength, topic] = useChatStore((s) => [
    topicSelectors.currentTopicLength(s),
    topicSelectors.currentActiveTopic(s),
  ]);
  const isInbox = useSessionStore(sessionSelectors.isInboxSession);
  const title = useAgentStore(agentSelectors.currentAgentTitle);

  const displayTitle = isInbox ? 'Lobe AI' : title;

  return (
    <ChatHeader.Title
      desc={
        <Flexbox align={'center'} gap={4} horizontal onClick={() => toggleConfig()}>
          <span style={styles.style}>{topic?.title || t('title', { ns: 'topic' })}</span>
          <ActionIcon
            active
            icon={ChevronDown}
            size={{ blockSize: 14, borderRadius: '50%', size: 12 }}
            style={styles.colored}
          />
        </Flexbox>
      }
      title={
        <div onClick={() => toggleConfig()} style={styles.spacing}>
          {displayTitle}
          {topicLength > 1 ? `(${topicLength + 1})` : ''}
        </div>
      }
    />
  );
});

export default ChatHeaderTitle;
