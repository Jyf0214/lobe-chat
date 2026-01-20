import { Flexbox, Highlighter } from '@lobehub/ui';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    overflow: 'scroll',
  },
  style1: {
    overflow: 'scroll',
    whiteSpace: 'pre',
  },
});

interface JsonViewerProps {
  data: object;
}

const JsonViewer = memo<JsonViewerProps>(({ data }) => {
  return (
    <Flexbox style={styles.style}>
      <Highlighter language={'json'} style={styles.style1}>
        {JSON.stringify(data, null, 2)}
      </Highlighter>
    </Flexbox>
  );
});

export default JsonViewer;
