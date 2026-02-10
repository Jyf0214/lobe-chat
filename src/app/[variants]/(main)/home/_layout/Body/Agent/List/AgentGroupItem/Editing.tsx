import { Flexbox, Input, stopPropagation } from '@lobehub/ui';
import { type InputRef, Popover } from 'antd';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { useHomeStore } from '@/store/home';

interface EditingProps {
  id: string;
  title: string;
  toggleEditing: (visible?: boolean) => void;
}

const Editing = memo<EditingProps>(({ id, title, toggleEditing }) => {
  const editing = useHomeStore((s) => s.groupRenamingId === id);

  const [newTitle, setNewTitle] = useState(title);

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
    const hasChanges = newTitle && title !== newTitle;

    if (hasChanges) {
      try {
        useHomeStore.getState().setGroupUpdatingId(id);
        await useHomeStore.getState().renameAgentGroup(id, newTitle);
      } finally {
        useHomeStore.getState().setGroupUpdatingId(null);
      }
    }
    toggleEditing(false);
  }, [newTitle, title, id, toggleEditing]);

  return (
    <Popover
      open={editing}
      overlayInnerStyle={{ padding: 4 }}
      placement="bottomLeft"
      trigger="click"
      content={
        <Flexbox horizontal gap={4} style={{ width: 280 }} onClick={stopPropagation}>
          <Input
            defaultValue={title}
            ref={inputRef}
            style={{ flex: 1 }}
            onBlur={() => handleUpdate()}
            onChange={(e) => setNewTitle(e.target.value)}
            onPressEnter={() => handleUpdate()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') toggleEditing(false);
            }}
          />
        </Flexbox>
      }
    >
      <div />
    </Popover>
  );
});

export default Editing;
