import { Flexbox } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors, dbMessageSelectors } from '@/store/chat/selectors';
import { safeParseJSON } from '@/utils/safeParseJSON';
import { StyleSheet } from '@/utils/styles';

import ToolRender from './ToolRender';

const styles = StyleSheet.create({
  style: {
    overflow: 'auto',
  },
});

const ToolUI = () => {
  const messageId = useChatStore(chatPortalSelectors.toolMessageId);
  const message = useChatStore(dbMessageSelectors.getDbMessageById(messageId || ''), isEqual);
  console.log(messageId, message);
  // make sure the message and id is valid
  if (!messageId || !message) return;

  const { plugin } = message;

  // make sure the plugin and identifier is valid
  if (!plugin || !plugin.identifier) return;

  const args = safeParseJSON(plugin.arguments);

  if (!args) return;

  return (
    <Flexbox flex={1} height={'100%'} paddingInline={12} style={styles.style}>
      <ToolRender />
    </Flexbox>
  );
};

export default ToolUI;
