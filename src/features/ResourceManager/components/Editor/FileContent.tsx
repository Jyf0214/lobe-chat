'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import FileViewer from '@/features/FileViewer';
import { fileManagerSelectors, useFileStore } from '@/store/file';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    overflow: 'auto',
  },
});

interface FilePreviewerProps {
  fileId?: string;
}

const FilePreviewer = memo<FilePreviewerProps>(({ fileId }) => {
  const useFetchKnowledgeItem = useFileStore((s) => s.useFetchKnowledgeItem);
  const { data: fetchedFile } = useFetchKnowledgeItem(fileId);
  const file = useFileStore(fileManagerSelectors.getFileById(fileId));

  const displayFile = file || fetchedFile;

  if (!fileId || !displayFile) return null;

  return (
    <Flexbox height={'100%'} width={'100%'}>
      <Flexbox flex={1} height={'100%'} style={styles.style}>
        <FileViewer {...displayFile} />
      </Flexbox>
    </Flexbox>
  );
});

FilePreviewer.displayName = 'FilePreviewer';

export default FilePreviewer;
