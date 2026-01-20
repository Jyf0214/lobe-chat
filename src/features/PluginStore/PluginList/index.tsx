import { DraggablePanel, Flexbox } from '@lobehub/ui';
import { cssVar, useTheme } from 'antd-style';
import { Suspense, memo, useRef } from 'react';

import { StyleSheet } from '@/utils/styles';

import Detail from './Detail';
import DetailLoading from './Detail/Loading';
import List from './List';

const styles = StyleSheet.create({
  colored: {
    borderTop: `1px solid ${cssVar.colorBorderSecondary}`,
    overflow: 'hidden',
    position: 'relative',
  },
  colored1: {
    background: undefined,
    overflowX: 'hidden',
    overflowY: 'auto',
  },
});

export const PluginList = memo(() => {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme(); // Keep for colorBgContainerSecondary (not in cssVar)

  return (
    <Flexbox height={'75vh'} horizontal style={styles.colored} width={'100%'}>
      <DraggablePanel maxWidth={1024} minWidth={420} placement={'left'}>
        <List />
      </DraggablePanel>
      <Flexbox
        height={'100%'}
        padding={16}
        ref={ref}
        style={{ ...styles.colored1, background: theme.colorBgContainerSecondary }}
        width={'100%'}
      >
        <Suspense fallback={<DetailLoading />}>
          <Detail />
        </Suspense>
      </Flexbox>
    </Flexbox>
  );
});

export default PluginList;
