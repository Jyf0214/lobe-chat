import { Avatar, Block, Flexbox, Input,stopPropagation } from '@lobehub/ui';
import { DEFAULT_AVATAR } from '@lobechat/const';
import { type InputRef, Popover } from 'antd';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import EmojiPicker from '@/components/EmojiPicker';
import { useIsDark } from '@/hooks/useIsDark';
import { useAgentStore } from '@/store/agent';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { useHomeStore } from '@/store/home';

interface EditingProps {
  avatar?: string;
  id: string;
  title: string;
  toggleEditing: (visible?: boolean) => void;
}

const Editing = memo<EditingProps>(({ id, title, avatar, toggleEditing }) => {
  const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);
  const isDarkMode = useIsDark();

  const editing = useHomeStore((s) => s.agentRenamingId === id);

  const currentAvatar = avatar || DEFAULT_AVATAR;

  const [newTitle, setNewTitle] = useState(title);
  const [newAvatar, setNewAvatar] = useState(currentAvatar);

  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (editing) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [editing]);

  const handleUpdate = useCallback(async () => {
    const hasChanges =
      (newTitle && title !== newTitle) || (newAvatar && currentAvatar !== newAvatar);

    if (hasChanges) {
      try {
        useHomeStore.getState().setAgentUpdatingId(id);

        const updates: { avatar?: string; title?: string } = {};
        if (newTitle && title !== newTitle) updates.title = newTitle;
        if (newAvatar && currentAvatar !== newAvatar) updates.avatar = newAvatar;

        await useAgentStore.getState().optimisticUpdateAgentMeta(id, updates);
        await useHomeStore.getState().refreshAgentList();
      } finally {
        useHomeStore.getState().setAgentUpdatingId(null);
      }
    }
    toggleEditing(false);
  }, [newTitle, newAvatar, title, currentAvatar, id, toggleEditing]);

  return (
    <Popover
      open={editing}
      overlayInnerStyle={{ padding: 4 }}
      placement="bottomLeft"
      trigger="click"
      content={
        <Flexbox horizontal gap={4} style={{ width: 320 }} onClick={stopPropagation}>
          <EmojiPicker
            locale={locale}
            shape={'square'}
            value={newAvatar}
            customRender={(avatarValue) => (
              <Block
                clickable
                align={'center'}
                height={36}
                justify={'center'}
                variant={isDarkMode ? 'filled' : 'outlined'}
                width={36}
                onClick={stopPropagation}
              >
                <Avatar
                  emojiScaleWithBackground
                  avatar={avatarValue || DEFAULT_AVATAR}
                  shape={'square'}
                  size={32}
                />
              </Block>
            )}
            onChange={setNewAvatar}
          />
          <Input
            defaultValue={title}
            ref={inputRef}
            style={{ flex: 1 }}
            onChange={(e) => setNewTitle(e.target.value)}
            onPressEnter={() => handleUpdate()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') toggleEditing(false);
            }}
          />
        </Flexbox>
      }
      onOpenChange={(open) => {
        if (!open) handleUpdate();
      }}
    >
      <div />
    </Popover>
  );
});

export default Editing;
