import { DraggablePanel, Flexbox } from '@lobehub/ui';
import { cssVar, useTheme } from 'antd-style';
import { memo, useRef } from 'react';

import dynamic from '@/libs/next/dynamic';
import { useServerConfigStore } from '@/store/serverConfig';
import { useToolStore } from '@/store/tool';
import { StyleSheet } from '@/utils/styles';

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

const Detail = dynamic(() => import('./Detail'), { loading: DetailLoading, ssr: false });

export const MCPPluginList = memo(() => {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme(); // Keep for colorBgContainerSecondary (not in cssVar)

  const mobile = useServerConfigStore((s) => s.isMobile);

  return (
    <Flexbox height={'75vh'} horizontal style={styles.colored} width={'100%'}>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <DraggablePanel maxWidth={1024} minWidth={mobile ? '100vw' : 420} placement={'left'}>
        <List
          setIdentifier={(identifier) => {
            useToolStore.setState({ activeMCPIdentifier: identifier });
            ref?.current?.scrollTo({ top: 0 });
          }}
        />
      </DraggablePanel>
      <Flexbox
        height={'100%'}
        padding={16}
        ref={ref}
        style={{ ...styles.colored1, background: theme.colorBgContainerSecondary }}
        width={'100%'}
      >
        <Detail />
      </Flexbox>
    </Flexbox>
  );
});

export default MCPPluginList;
