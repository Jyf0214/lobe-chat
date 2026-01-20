import { ScrollShadow } from '@lobehub/ui';
import { type FC, type PropsWithChildren, useMemo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  spacing: {
    paddingBottom: 16,
    position: 'sticky',
  },
});

const CategoryContainer: FC<PropsWithChildren<{ top?: number }>> = ({ children, top = 16 }) => {
  const dynamicStyles = useMemo(
    () => ({
      ...styles.spacing,
      top,
    }),
    [top],
  );

  return (
    <ScrollShadow
      as={'aside'}
      flex={'none'}
      height={`calc(100vh - ${top * 2 + 4}px)`}
      hideScrollBar
      offset={16}
      size={4}
      style={dynamicStyles}
      width={280}
    >
      {children}
    </ScrollShadow>
  );
};

export default CategoryContainer;
