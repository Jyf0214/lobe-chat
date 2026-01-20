import { Block, Flexbox, Text } from '@lobehub/ui';
import { memo } from 'react';

import FileIcon from '@/components/FileIcon';
import { useChatStore } from '@/store/chat';
import { type ChatFileItem } from '@/types/index';
import { formatSize } from '@/utils/format';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    overflow: 'hidden',
  },
});

const FileItem = memo<ChatFileItem>(({ id, fileType, size, name }) => {
  const openFilePreview = useChatStore((s) => s.openFilePreview);

  return (
    <Block
      align={'center'}
      clickable
      gap={12}
      horizontal
      key={id}
      onClick={() => {
        openFilePreview({ fileId: id });
      }}
      paddingBlock={8}
      paddingInline={'12px 16px'}
      variant={'outlined'}
    >
      <FileIcon fileName={name} fileType={fileType} size={32} />
      <Flexbox style={styles.style}>
        <Text ellipsis>{name}</Text>
        <Text fontSize={12} type={'secondary'}>
          {formatSize(size)}
        </Text>
      </Flexbox>
    </Block>
  );
});
export default FileItem;
