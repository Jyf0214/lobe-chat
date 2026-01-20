import { Flexbox, Highlighter } from '@lobehub/ui';
import { type ReactNode, memo } from 'react';

import Image from '@/libs/next/Image';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    height: 'auto',
    maxWidth: '100%',
  },
  style1: {
    maxHeight: 400,
    overflow: 'auto',
  },
});

const TooltipContent = memo<{ children: ReactNode }>(({ children }) => {
  if (typeof children !== 'string') return children;

  if (children.startsWith('data:image')) {
    return <Image alt={'tooltip-image'} src={children} style={styles.style} unoptimized />;
  }

  if (children.startsWith('http'))
    return (
      <a href={children} rel="noreferrer" target="_blank">
        {children}
      </a>
    );

  const code = children.trim().trimEnd();

  if ((code.startsWith('{') && code.endsWith('}')) || (code.startsWith('[') && code.endsWith(']')))
    return (
      <Highlighter language={'json'} style={styles.style1} variant={'borderless'}>
        {JSON.stringify(JSON.parse(code), null, 2)}
      </Highlighter>
    );

  return <Flexbox>{children}</Flexbox>;
});

export default TooltipContent;
