import { Flexbox, ScrollShadow } from '@lobehub/ui';
import { memo } from 'react';

import { useQuery } from '@/hooks/useQuery';
import { ModelNavKey } from '@/types/discover';
import { StyleSheet } from '@/utils/styles';

import ActionButton from './ActionButton';
import Related from './Related';
import RelatedProviders from './RelatedProviders';

const styles = StyleSheet.create({
  spacing: {
    maxHeight: 'calc(100vh - 76px)',
    paddingBottom: 24,
    position: 'sticky',
    top: 16,
  },
});

const Sidebar = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { activeTab = ModelNavKey.Overview } = useQuery() as { activeTab: ModelNavKey };

  if (mobile) {
    return (
      <Flexbox gap={32}>
        <ActionButton />
      </Flexbox>
    );
  }

  return (
    <ScrollShadow flex={'none'} gap={32} hideScrollBar size={4} style={styles.spacing} width={360}>
      <ActionButton />
      {activeTab !== ModelNavKey.Related && <Related />}
      {activeTab !== ModelNavKey.Overview && <RelatedProviders />}
    </ScrollShadow>
  );
});

export default Sidebar;
