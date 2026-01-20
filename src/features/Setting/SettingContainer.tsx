'use client';

import { Flexbox, type FlexboxProps } from '@lobehub/ui';
import { cssVar, useTheme } from 'antd-style';
import { type PropsWithChildren, type ReactNode, memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  colored: {
    overflowX: 'hidden',
    overflowY: 'auto',
  },
});

interface SettingContainerProps extends FlexboxProps {
  addonAfter?: ReactNode;
  addonBefore?: ReactNode;
  maxWidth?: number | string;
  variant?: 'default' | 'secondary';
}
const SettingContainer = memo<PropsWithChildren<SettingContainerProps>>(
  ({ variant, maxWidth = 1024, children, addonAfter, addonBefore, style, ...rest }) => {
    const theme = useTheme(); // Keep for colorBgContainerSecondary (not in cssVar)

    const coloredStyle = {
      ...styles.colored,
      background:
        variant === 'secondary' ? theme.colorBgContainerSecondary : cssVar.colorBgContainer,
      ...style,
    };

    const styleObject = {
      maxWidth,
    };
    return (
      <Flexbox align={'center'} height={'100%'} style={coloredStyle} width={'100%'} {...rest}>
        {addonBefore}
        <Flexbox flex={1} gap={36} style={styleObject} width={'100%'}>
          {children}
        </Flexbox>
        {addonAfter}
      </Flexbox>
    );
  },
);

export default SettingContainer;
