import { Flexbox } from '@lobehub/ui';
import { Drawer } from 'antd';
import { cssVar } from 'antd-style';
import { memo } from 'react';

import dynamic from '@/libs/next/dynamic';
import { fileManagerSelectors, useFileStore } from '@/store/file';
import { StyleSheet } from '@/utils/styles';

import Content from './Content';

const styles = StyleSheet.create({
  colored: {
    borderInlineStart: `1px solid ${cssVar.colorSplit}`,
  },
  style: {
    overflow: 'hidden',
  },
  style1: {
    overflow: 'scroll',
  },
});

const FileViewer = dynamic(() => import('@/features/FileViewer'), { ssr: false });

/**
 * Showing the chunk info of a file
 */
const ChunkDrawer = memo(() => {
  const [fileId, open, closeChunkDrawer] = useFileStore((s) => [
    s.chunkDetailId,
    !!s.chunkDetailId,
    s.closeChunkDrawer,
  ]);
  const file = useFileStore(fileManagerSelectors.getFileById(fileId));

  return (
    <Drawer
      onClose={() => {
        closeChunkDrawer();
      }}
      open={open}
      size="large"
      styles={{
        body: { padding: 0 },
      }}
      title={file?.name}
    >
      <Flexbox height={'100%'} horizontal style={styles.style}>
        {file && (
          <Flexbox flex={2} style={styles.style1}>
            <FileViewer {...file} />
          </Flexbox>
        )}
        <Flexbox flex={1} style={styles.colored}>
          <Content />
        </Flexbox>
      </Flexbox>
    </Drawer>
  );
});

export default ChunkDrawer;
