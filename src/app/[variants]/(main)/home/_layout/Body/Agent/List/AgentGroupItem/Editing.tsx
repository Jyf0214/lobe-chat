import { type GroupMemberAvatar } from '@lobechat/types';
import { Avatar, Block, Flexbox, Input, stopPropagation } from '@lobehub/ui';
import { type InputRef, Popover } from 'antd';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import EmojiPicker from '@/components/EmojiPicker';
import GroupAvatar from '@/features/GroupAvatar';
import { useIsDark } from '@/hooks/useIsDark';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { useHomeStore } from '@/store/home';

interface EditingProps {
  avatar?: string;
  id: string;
  memberAvatars?: GroupMemberAvatar[];
  title: string;
  toggleEditing: (visible?: boolean) => void;
}

const Editing = memo<EditingProps>(({ id, title, avatar, memberAvatars, toggleEditing }) => {
  const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);
  const isDarkMode = useIsDark();

  const editing = useHomeStore((s) => s.groupRenamingId === id);

  const [newTitle, setNewTitle] = useState(title);
  const [newAvatar, setNewAvatar] = useState(avatar);

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
    const hasChanges = (newTitle && title !== newTitle) || newAvatar !== avatar;

    if (hasChanges) {
      try {
        useHomeStore.getState().setGroupUpdatingId(id);
        await useHomeStore
          .getState()
          .renameAgentGroup(id, newTitle || title, newAvatar !== avatar ? newAvatar : undefined);
      } finally {
        useHomeStore.getState().setGroupUpdatingId(null);
      }
    }
    toggleEditing(false);
  }, [newTitle, newAvatar, title, avatar, id, toggleEditing]);

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
                onClick={(e) => e.stopPropagation()}
              >
                {avatarValue ? (
                  <Avatar
                    emojiScaleWithBackground
                    avatar={avatarValue}
                    shape={'square'}
                    size={32}
                  />
                ) : (
                  <GroupAvatar avatars={memberAvatars || []} size={32} />
                )}
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
