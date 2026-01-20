import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import DragUploadZone, { useUploadFiles } from '@/components/DragUploadZone';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { StyleSheet } from '@/utils/styles';

import ConversationArea from './ConversationArea';
import ChatHeader from './Header';

const styles = StyleSheet.create({
  fullWidth: {
    height: '100%',
    width: '100%',
  },
  style: {
    overflow: 'hidden',
    position: 'relative',
  },
});

const ChatConversation = memo(() => {
  const showHeader = useGlobalStore(systemStatusSelectors.showChatHeader);

  // Get current agent's model info for vision support check
  const model = useAgentStore(agentSelectors.currentAgentModel);
  const provider = useAgentStore(agentSelectors.currentAgentModelProvider);
  const { handleUploadFiles } = useUploadFiles({ model, provider });

  return (
    <DragUploadZone onUploadFiles={handleUploadFiles} style={styles.fullWidth}>
      <Flexbox height={'100%'} style={styles.style} width={'100%'}>
        {showHeader && <ChatHeader />}
        <ConversationArea />
      </Flexbox>
    </DragUploadZone>
  );
});

ChatConversation.displayName = 'ChatConversation';

export default ChatConversation;
