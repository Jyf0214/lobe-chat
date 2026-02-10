import { Flexbox, Input, stopPropagation } from '@lobehub/ui';
import { type InputRef, message,Popover } from 'antd';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import EmojiPicker from '@/components/EmojiPicker';
import { useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { useHomeStore } from '@/store/home';

const MAX_AVATAR_SIZE = 1024 * 1024;

interface EditingProps {
  avatar?: string;
  id: string;
  title: string;
  toggleEditing: (visible?: boolean) => void;
}

const Editing = memo<EditingProps>(({ id, title, avatar, toggleEditing }) => {
  const { t } = useTranslation('setting');
  const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);

  const editing = useHomeStore((s) => s.groupRenamingId === id);
  const uploadWithProgress = useFileStore((s) => s.uploadWithProgress);

  const [newTitle, setNewTitle] = useState(title);
  const [newAvatar, setNewAvatar] = useState(avatar);
  const [uploading, setUploading] = useState(false);

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

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      if (file.size > MAX_AVATAR_SIZE) {
        message.error(t('settingAgent.avatar.sizeExceeded'));
        return;
      }

      setUploading(true);
      try {
        const result = await uploadWithProgress({ file });
        if (result?.url) {
          setNewAvatar(result.url);
        }
      } finally {
        setUploading(false);
      }
    },
    [uploadWithProgress, t],
  );

  const handleAvatarDelete = useCallback(() => {
    setNewAvatar(undefined);
  }, []);

  return (
    <Popover
      open={editing}
      overlayInnerStyle={{ padding: 4 }}
      placement="bottomLeft"
      trigger="click"
      content={
        <Flexbox horizontal gap={4} style={{ width: 320 }} onClick={stopPropagation}>
          <EmojiPicker
            allowUpload
            allowDelete={!!newAvatar}
            loading={uploading}
            locale={locale}
            shape={'square'}
            size={36}
            value={newAvatar}
            onChange={setNewAvatar}
            onDelete={handleAvatarDelete}
            onUpload={handleAvatarUpload}
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
