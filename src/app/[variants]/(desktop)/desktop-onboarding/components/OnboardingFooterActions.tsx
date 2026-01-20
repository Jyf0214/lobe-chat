import { Flexbox, type FlexboxProps } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { type ReactNode, memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  fullWidth: {
    background: cssVar.colorBgContainer,
    bottom: 0,
    marginTop: 'auto',
    paddingTop: 16,
    position: 'sticky',
    width: '100%',
    zIndex: 10,
  },
});

interface OnboardingFooterActionsProps extends Omit<FlexboxProps, 'children'> {
  left?: ReactNode;
  right?: ReactNode;
}

const OnboardingFooterActions = memo<OnboardingFooterActionsProps>(
  ({ left, right, style, ...rest }) => {
    return (
      <Flexbox
        align={'center'}
        horizontal
        justify={'space-between'}
        style={StyleSheet.compose(styles.fullWidth, style)}
        {...rest}
      >
        <div>{left}</div>
        <div>{right}</div>
      </Flexbox>
    );
  },
);

OnboardingFooterActions.displayName = 'OnboardingFooterActions';

export default OnboardingFooterActions;
