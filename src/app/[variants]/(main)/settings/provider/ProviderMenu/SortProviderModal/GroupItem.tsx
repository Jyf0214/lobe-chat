import { ProviderIcon } from '@lobehub/icons';
import { Avatar, Flexbox, SortableList } from '@lobehub/ui';
import { memo } from 'react';

import { type AiProviderListItem } from '@/types/aiProvider';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    borderRadius: 6,
  },
});

const GroupItem = memo<AiProviderListItem>(({ id, name, source, logo }) => {
  return (
    <>
      <Flexbox gap={8} horizontal>
        {source === 'custom' && logo ? (
          <Avatar alt={name || id} avatar={logo} shape={'square'} size={24} style={styles.style} />
        ) : (
          <ProviderIcon provider={id} size={24} style={styles.style} type={'avatar'} />
        )}
        {name}
      </Flexbox>
      <SortableList.DragHandle />
    </>
  );
});

export default GroupItem;
