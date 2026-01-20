import { Highlighter } from '@lobehub/ui';
import { cx } from 'antd-style';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

import { containerStyles } from '../style';

const styles = StyleSheet.create({
  spacing: {
    padding: 16,
  },
  style: {
    fontSize: 12,
  },
});

const Preview = memo<{ content: string }>(({ content }) => {
  return (
    <div
      className={cx(containerStyles.preview, containerStyles.previewWide)}
      style={styles.spacing}
    >
      <Highlighter language={'json'} style={styles.style} variant={'borderless'} wrap>
        {content}
      </Highlighter>
    </div>
  );
});

export default Preview;
