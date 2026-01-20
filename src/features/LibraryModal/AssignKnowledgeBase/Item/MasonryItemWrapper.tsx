import { memo } from 'react';

import { type KnowledgeItem } from '@/types/knowledgeBase';
import { StyleSheet } from '@/utils/styles';

import MasonryItem from './MasonryItem';

const styles = StyleSheet.create({
  spacing: {
    padding: '8px 4px',
  },
});

interface MasonryItemWrapperProps {
  data: KnowledgeItem;
  index: number;
}

const MasonryItemWrapper = memo<MasonryItemWrapperProps>(({ data: item }) => {
  // Safety check: return null if item is undefined
  if (!item || !item.id) {
    return null;
  }

  return (
    <div style={styles.spacing}>
      <MasonryItem {...item} />
    </div>
  );
});

MasonryItemWrapper.displayName = 'MasonryItemWrapper';

export default MasonryItemWrapper;
