import { Flexbox, type FlexboxProps } from '@lobehub/ui';
import { type FC } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    position: 'relative',
    width: 320,
  },
});

const SidebarContainer: FC<FlexboxProps> = ({ children, style, ...rest }) => {
  return (
    <Flexbox
      flex={'none'}
      gap={48}
      height={'100%'}
      style={StyleSheet.compose(styles.style, style)}
      width={'100%'}
      {...rest}
    >
      {children}
    </Flexbox>
  );
};

export default SidebarContainer;
