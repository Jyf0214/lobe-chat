import { type PluginRender, type PluginRenderProps } from '@lobehub/chat-plugin-sdk/client';
import { Skeleton } from '@lobehub/ui';
import { memo, useEffect, useState } from 'react';

import { StyleSheet } from '@/utils/styles';

import { system } from './utils';

const styles = StyleSheet.create({
  style: {
    width: 300,
  },
});

interface SystemJsRenderProps extends PluginRenderProps {
  url: string;
}

const RenderCache: {
  [url: string]: PluginRender;
} = {};

const SystemJsRender = memo<SystemJsRenderProps>(({ url, ...props }) => {
  const [component, setComp] = useState<PluginRender | undefined>(RenderCache[url]);

  useEffect(() => {
    system
      .import(url)
      .then((module1) => {
        setComp(module1.default);
        RenderCache[url] = module1.default;
        // 使用module1模块
      })
      .catch((error) => {
        setComp(undefined);
        console.error(error);
      });
  }, [url]);

  if (!component) {
    return <Skeleton active style={styles.style} />;
  }

  const Render = component;

  return <Render {...props} />;
});
export default SystemJsRender;
