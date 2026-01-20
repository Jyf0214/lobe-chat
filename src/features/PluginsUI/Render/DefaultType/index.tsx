import { Skeleton } from '@lobehub/ui';
import { Suspense, memo } from 'react';

import dynamic from '@/libs/next/dynamic';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { StyleSheet } from '@/utils/styles';

import Loading from '../Loading';
import { useParseContent } from '../useParseContent';
import IFrameRender from './IFrameRender';

const styles = StyleSheet.create({
  style: {
    width: 400,
  },
});

const SystemJsRender = dynamic(() => import('./SystemJsRender'), { ssr: false });

export interface PluginDefaultTypeProps {
  content: string;
  loading?: boolean;
  name?: string;
}

const PluginDefaultType = memo<PluginDefaultTypeProps>(({ content, name, loading }) => {
  const manifest = useToolStore(pluginSelectors.getToolManifestById(name || ''));

  const { isJSON, data } = useParseContent(content);

  if (!isJSON) {
    return loading && <Loading />;
  }

  if (!manifest?.ui) return;

  const ui = manifest.ui;

  if (!ui.url) return;

  if (ui.mode === 'module')
    return (
      <Suspense fallback={<Skeleton active style={styles.style} />}>
        <SystemJsRender content={data} name={name || 'unknown'} url={ui.url} />
      </Suspense>
    );

  return (
    <IFrameRender
      content={data}
      height={ui.height}
      name={name || 'unknown'}
      url={ui.url}
      width={ui.width}
    />
  );
});

export default PluginDefaultType;
