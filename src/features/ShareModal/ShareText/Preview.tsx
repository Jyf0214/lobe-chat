import { Markdown } from '@lobehub/ui';
import { cx } from 'antd-style';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

import { containerStyles } from '../style';

const styles = StyleSheet.create({
  spacing: {
    padding: 12,
  },
});

const Preview = memo<{ content: string }>(({ content }) => {
  return (
    <div
      className={cx(containerStyles.preview, containerStyles.previewWide)}
      style={styles.spacing}
    >
      <Markdown variant={'chat'}>{content}</Markdown>
    </div>
  );
});

export default Preview;
