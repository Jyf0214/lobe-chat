import { Block, Flexbox, Text } from '@lobehub/ui';
import { memo } from 'react';

import PluginAvatar from '@/components/Plugins/PluginAvatar';
import PluginTag from '@/components/Plugins/PluginTag';
import { type DiscoverPluginItem } from '@/types/discover';
import { type LobeToolType } from '@/types/tool/tool';
import { StyleSheet } from '@/utils/styles';

import Actions from './Action';

const styles = StyleSheet.create({
  style: {
    position: 'relative',
  },
  style1: {
    overflow: 'hidden',
    position: 'relative',
  },
});

interface PluginItemProps extends DiscoverPluginItem {
  active?: boolean;
  onClick?: () => void;
  runtimeType?: 'mcp' | 'default' | 'markdown' | 'standalone' | undefined;
  type: LobeToolType;
}

const Item = memo<PluginItemProps>(
  ({ title, description, avatar, onClick, active, identifier, author, runtimeType, type }) => {
    const isMCP = runtimeType === 'mcp';

    return (
      <Block
        align={'center'}
        clickable
        gap={8}
        horizontal
        justify={'space-between'}
        onClick={onClick}
        paddingBlock={8}
        paddingInline={12}
        style={styles.style}
        variant={active ? 'filled' : 'borderless'}
      >
        <Flexbox align={'center'} flex={1} gap={8} horizontal style={styles.style1}>
          <PluginAvatar avatar={avatar} />
          <Flexbox flex={1} gap={4} style={styles.style1}>
            <Flexbox align={'center'} gap={4} horizontal>
              <Text ellipsis strong>
                {title}
              </Text>
              <PluginTag author={author} isMCP={isMCP} type={type!} />
            </Flexbox>
            <Text ellipsis fontSize={12} type={'secondary'}>
              {description}
            </Text>
          </Flexbox>
        </Flexbox>
        <Actions identifier={identifier} isMCP={isMCP} type={type!} />
      </Block>
    );
  },
);

export default Item;
