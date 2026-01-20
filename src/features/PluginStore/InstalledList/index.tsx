import { Center, DraggablePanel, Empty, Flexbox } from '@lobehub/ui';
import { cssVar, useTheme } from 'antd-style';
import { Plug2 } from 'lucide-react';
import { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { type LobeToolType } from '@/types/tool/tool';
import { StyleSheet } from '@/utils/styles';

import PluginEmpty from '../PluginEmpty';
import Detail from './Detail';
import List from './List';

const styles = StyleSheet.create({
  colored: {
    borderTop: `1px solid ${cssVar.colorBorderSecondary}`,
    overflow: 'hidden',
    position: 'relative',
  },
  colored1: {
    background: undefined,
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  colored2: {
    background: undefined,
  },
  style: {
    maxWidth: 400,
  },
});

const PluginList = memo<{ keywords?: string }>(({ keywords }) => {
  const { t } = useTranslation('plugin');
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme(); // Keep for colorBgContainerSecondary (not in cssVar)

  const [type, setType] = useState<LobeToolType>();
  const [runtimeType, setRuntimeType] = useState<'mcp' | 'default'>();

  const [identifier] = useToolStore((s) => [s.activePluginIdentifier]);
  const isEmpty = useToolStore((s) => pluginSelectors.installedPluginMetaList(s).length === 0);

  if (isEmpty)
    return (
      <Center height={'75vh'}>
        <PluginEmpty />
      </Center>
    );

  return (
    <Flexbox height={'75vh'} horizontal style={styles.colored} width={'100%'}>
      <DraggablePanel maxWidth={1024} minWidth={420} placement={'left'}>
        <List
          identifier={identifier}
          keywords={keywords}
          setIdentifier={({ identifier, type, runtimeType }) => {
            useToolStore.setState({ activePluginIdentifier: identifier });
            setType(type);
            setRuntimeType(runtimeType);
            ref?.current?.scrollTo({ top: 0 });
          }}
        />
      </DraggablePanel>
      {identifier ? (
        <Flexbox
          height={'100%'}
          padding={16}
          ref={ref}
          style={{ ...styles.colored1, background: theme.colorBgContainerSecondary }}
          width={'100%'}
        >
          <Detail identifier={identifier} runtimeType={runtimeType} type={type} />
        </Flexbox>
      ) : (
        <Center
          height={'100%'}
          style={{ ...styles.colored2, background: theme.colorBgContainerSecondary }}
          width={'100%'}
        >
          <Empty
            description={t('store.emptySelectHint')}
            descriptionProps={{ fontSize: 14 }}
            icon={Plug2}
            style={styles.style}
          />
        </Center>
      )}
    </Flexbox>
  );
});

export default PluginList;
