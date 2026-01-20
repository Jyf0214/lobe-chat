import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet } from '@/utils/styles';

import type { ChatMessage } from './types';

const sheetStyles = StyleSheet.create({
  spacing: {
    opacity: 0.5,
    padding: '16px',
    textAlign: 'center',
  },
});

interface ChatListProps {
  messages: ChatMessage[];
  styles: {
    chatContainer: string;
    chatMessage: string;
    chatMessageContent: string;
    chatMessageRole: string;
  };
}

const ChatList = memo<ChatListProps>(({ messages, styles }) => {
  const { t } = useTranslation('common');

  return (
    <div className={styles.chatContainer}>
      {messages.length === 0 ? (
        <div style={sheetStyles.spacing}>{t('cmdk.aiModeEmptyState')}</div>
      ) : (
        messages.map((message) => (
          <div className={styles.chatMessage} key={message.id}>
            <div className={styles.chatMessageRole}>{message.role}</div>
            <div className={styles.chatMessageContent}>{message.content}</div>
          </div>
        ))
      )}
    </div>
  );
});

ChatList.displayName = 'ChatList';

export default ChatList;
