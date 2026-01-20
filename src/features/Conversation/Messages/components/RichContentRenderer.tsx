import { Flexbox, Image, Markdown } from '@lobehub/ui';
import { memo } from 'react';

import { type MessageContentPart } from '@/types/index';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    borderRadius: 8,
    maxWidth: '100%',
  },
});

interface RichContentRendererProps {
  parts: MessageContentPart[];
}

export const RichContentRenderer = memo<RichContentRendererProps>(({ parts }) => {
  return (
    <Flexbox gap={8}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <Markdown key={index} variant="chat">
              {part.text}
            </Markdown>
          );
        }

        if (part.type === 'image') {
          return <Image key={index} src={part.image} style={styles.style} />;
        }

        return null;
      })}
    </Flexbox>
  );
});

RichContentRenderer.displayName = 'RichContentRenderer';
