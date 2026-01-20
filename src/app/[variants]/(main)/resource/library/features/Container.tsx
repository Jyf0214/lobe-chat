'use client';

import { Flexbox } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { type FC, type PropsWithChildren } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  colored: {
    overflowY: 'auto',
    position: 'relative',
  },
});

const Container: FC<PropsWithChildren> = ({ children }) => {
  const theme = useTheme();
  const coloredStyle = {
    ...styles.colored,
    background: theme.colorBgContainerSecondary,
  };

  return (
    <Flexbox flex={1} style={coloredStyle}>
      {children}
    </Flexbox>
  );
};

export default Container;
