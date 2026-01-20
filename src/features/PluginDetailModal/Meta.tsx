import { Block, Flexbox, Text } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import PluginAvatar from '@/features/PluginAvatar';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    fontSize: 12,
  },
});

const Meta = memo<{
  id: string;
}>(({ id }) => {
  const pluginMeta = useToolStore(pluginSelectors.getPluginMetaById(id), isEqual);

  return (
    <Block gap={16} horizontal padding={16} variant={'outlined'}>
      <PluginAvatar identifier={id} size={40} />
      <Flexbox gap={2}>
        <div>{pluginHelpers.getPluginTitle(pluginMeta)}</div>
        <Text style={styles.style} type={'secondary'}>
          {pluginHelpers.getPluginDesc(pluginMeta)}
        </Text>
      </Flexbox>
    </Block>
  );
});

export default Meta;
