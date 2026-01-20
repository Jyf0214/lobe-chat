import { Highlighter, Popover } from '@lobehub/ui';
import { type ReactNode, memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    maxHeight: 600,
    maxWidth: 400,
    overflow: 'scroll',
  },
});

interface PluginManifestPreviewerProps {
  children?: ReactNode;
  manifest: object;
  trigger?: 'click' | 'hover';
}

const ManifestPreviewer = memo<PluginManifestPreviewerProps>(
  ({ manifest, children, trigger = 'click' }) => (
    <Popover
      content={
        <Highlighter language={'json'} style={styles.style}>
          {JSON.stringify(manifest, null, 2)}
        </Highlighter>
      }
      placement={'right'}
      styles={{ content: { width: 400 } }}
      trigger={trigger}
    >
      {children}
    </Popover>
  ),
);

export default ManifestPreviewer;
