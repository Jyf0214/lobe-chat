import { Flexbox } from '@lobehub/ui';

import TopicListContent from '@/app/[variants]/(main)/agent/_layout/Sidebar/Topic/TopicListContent';
import TopicSearchBar from '@/app/[variants]/(main)/agent/_layout/Sidebar/Topic/TopicSearchBar';
import { StyleSheet } from '@/utils/styles';

import TopicModal from './features/TopicModal';

const styles = StyleSheet.create({
  spacing: {
    marginInline: -8,
    overflow: 'hidden',
    position: 'relative',
  },
  style: {
    overflow: 'hidden',
  },
});

const Topic = () => {
  return (
    <TopicModal>
      <Flexbox gap={8} height={'100%'} padding={'8px 8px 0'} style={styles.style}>
        <TopicSearchBar />
        <Flexbox height={'100%'} style={styles.spacing} width={'calc(100% + 16px)'}>
          <TopicListContent />
        </Flexbox>
      </Flexbox>
    </TopicModal>
  );
};

export default Topic;
