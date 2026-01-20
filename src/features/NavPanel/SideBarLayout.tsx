import { Flexbox, ScrollShadow, TooltipGroup } from '@lobehub/ui';
import { type ReactNode, Suspense, memo } from 'react';

import Footer from '@/app/[variants]/(main)/home/_layout/Footer';
import SkeletonList, { SkeletonItem } from '@/features/NavPanel/components/SkeletonList';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  spacing: {
    marginTop: 8,
  },
  style: {
    height: '100%',
    overflow: 'hidden',
  },
  style1: {
    height: '100%',
  },
});

interface SidebarLayoutProps {
  body?: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
}

const SideBarLayout = memo<SidebarLayoutProps>(({ header, body, footer }) => {
  return (
    <Flexbox gap={4} style={styles.style}>
      <Suspense fallback={<SkeletonItem height={44} style={styles.spacing} />}>{header}</Suspense>
      <ScrollShadow size={2} style={styles.style1}>
        <TooltipGroup>
          <Suspense fallback={<SkeletonList paddingBlock={8} />}>{body}</Suspense>
        </TooltipGroup>
      </ScrollShadow>
      <Suspense>{footer || <Footer />}</Suspense>
    </Flexbox>
  );
});

export default SideBarLayout;
