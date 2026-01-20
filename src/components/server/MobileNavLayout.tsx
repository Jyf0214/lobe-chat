import { Flexbox, type FlexboxProps } from '@lobehub/ui';
import { type ReactNode } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  spacing: {
    overflowX: 'hidden',
    overflowY: 'auto',
    position: 'relative',
  },
  spacing1: {
    overflowX: 'hidden',
    overflowY: 'auto',
    position: 'relative',
  },
  style: {
    overflow: 'hidden',
    position: 'relative',
  },
});

interface MobileContentLayoutProps extends FlexboxProps {
  header?: ReactNode;
  withNav?: boolean;
}

const MobileContentLayout = ({
  children,
  withNav,
  style,
  header,
  id = 'lobe-mobile-scroll-container',
  ...rest
}: MobileContentLayoutProps) => {
  const spacingStyle = {
    ...styles.spacing,
    paddingBottom: withNav ? 48 : style?.paddingBottom,
  };

  const content = (
    <Flexbox height="100%" id={id} style={spacingStyle} width="100%" {...rest}>
      {children}
    </Flexbox>
  );

  if (!header) return content;

  return (
    <Flexbox height={'100%'} style={styles.style} width={'100%'}>
      {header}
      <Flexbox
        height="100%"
        id={'lobe-mobile-scroll-container'}
        style={spacingStyle}
        width="100%"
        {...rest}
      >
        {children}
      </Flexbox>
    </Flexbox>
  );
};

export default MobileContentLayout;
