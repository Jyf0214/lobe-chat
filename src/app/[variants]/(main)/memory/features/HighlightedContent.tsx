import { Flexbox, Markdown, Text } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  colored: {
    color: cssVar.colorText,
    overflow: 'visible',
  },
});

interface HighlightedContentProps {
  children?: string | null;
  title?: string | null;
}

const HighlightedContent = memo<HighlightedContentProps>(({ title, children }) => {
  if (!children) return;
  const content = (
    <Markdown fontSize={14} style={styles.colored} variant={'chat'}>
      {children || ''}
    </Markdown>
  );

  if (!title) return content;

  return (
    <Flexbox gap={8}>
      <Text weight={500}>{title}</Text>
      {content}
    </Flexbox>
  );
});

export default HighlightedContent;
