import { Block, Flexbox, Input, Popover } from '@lobehub/ui';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import EmojiPicker from '@/components/EmojiPicker';
import { useIsDark } from '@/hooks/useIsDark';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { usePageStore } from '@/store/page';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  style: {
    width: 320,
  },
  style1: {
    fontSize: 20,
  },
});

interface EditingProps {
  currentEmoji?: string;
  documentId: string;
  title: string;
  toggleEditing: (visible?: boolean) => void;
}

const Editing = memo<EditingProps>(({ documentId, title, currentEmoji, toggleEditing }) => {
  const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);
  const isDarkMode = useIsDark();
  const { t } = useTranslation('file');

  const editing = usePageStore((s) => s.renamingPageId === documentId);

  const [newTitle, setNewTitle] = useState(title);
  const [newEmoji, setNewEmoji] = useState(currentEmoji);

  const handleUpdate = useCallback(async () => {
    const hasChanges =
      (newTitle && title !== newTitle) || (newEmoji !== undefined && currentEmoji !== newEmoji);

    if (hasChanges) {
      try {
        const updates: { emoji?: string; title?: string } = {};
        if (newTitle && title !== newTitle) updates.title = newTitle;
        if (newEmoji !== undefined && currentEmoji !== newEmoji) updates.emoji = newEmoji;

        await usePageStore.getState().renamePage(documentId, updates.title || title, updates.emoji);
      } catch (error) {
        console.error('Failed to update page:', error);
      }
    }
    toggleEditing(false);
  }, [newTitle, newEmoji, title, currentEmoji, documentId, toggleEditing]);

  return (
    <Popover
      content={
        <Flexbox gap={4} horizontal onClick={(e) => e.stopPropagation()} style={styles.style}>
          <EmojiPicker
            allowDelete
            customRender={(emoji) => (
              <Block
                align={'center'}
                clickable
                height={36}
                justify={'center'}
                onClick={(e) => e.stopPropagation()}
                variant={isDarkMode ? 'filled' : 'outlined'}
                width={36}
              >
                {emoji ? (
                  <span style={styles.style1}>{emoji}</span>
                ) : (
                  <span style={styles.style1}>📄</span>
                )}
              </Block>
            )}
            defaultAvatar={'📄'}
            locale={locale}
            onChange={setNewEmoji}
            onClick={(e) => e?.stopPropagation()}
            onDelete={() => setNewEmoji(undefined)}
            value={newEmoji}
          />
          <Input
            autoFocus
            defaultValue={title}
            onChange={(e) => setNewTitle(e.target.value)}
            onPressEnter={() => {
              handleUpdate();
              toggleEditing(false);
            }}
            placeholder={t('pageEditor.titlePlaceholder')}
            style={styles.flexContainer}
          />
        </Flexbox>
      }
      onOpenChange={(open) => {
        if (!open) handleUpdate();
        toggleEditing(open);
      }}
      open={editing}
      placement="bottomLeft"
      styles={{
        content: {
          padding: 4,
        },
      }}
      trigger="click"
    >
      <div />
    </Popover>
  );
});

export default Editing;
