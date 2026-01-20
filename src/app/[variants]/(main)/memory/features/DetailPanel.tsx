import { Flexbox, type FlexboxProps } from '@lobehub/ui';
import { memo } from 'react';

import NavHeader, { type NavHeaderProps } from '@/features/NavHeader';
import RightPanel from '@/features/RightPanel';
import ToggleRightPanelButton from '@/features/RightPanel/ToggleRightPanelButton';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  spacing: {
    minWidth: 300,
    overflowY: 'auto',
    paddingBottom: 64,
    paddingTop: 16,
  },
});

interface DetailPanelProps extends FlexboxProps {
  header?: NavHeaderProps;
}

const DetailPanel = memo<DetailPanelProps>(({ children, style, header, ...rest }) => {
  return (
    <RightPanel defaultWidth={480} maxWidth={640} minWidth={300}>
      <NavHeader
        {...header}
        left={
          <>
            <ToggleRightPanelButton />
            {header?.left}
          </>
        }
      />
      <Flexbox
        flex={1}
        gap={16}
        height={'100%'}
        paddingInline={16}
        style={StyleSheet.compose(styles.spacing, style)}
        {...rest}
      >
        {children}
      </Flexbox>
    </RightPanel>
  );
});

export default DetailPanel;
