import { Avatar, Block, Flexbox, Text } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { memo } from 'react';

import { RECENT_BLOCK_SIZE } from '@/app/[variants]/(main)/home/features/const';
import { DEFAULT_AVATAR } from '@/const/meta';
import { useIsDark } from '@/hooks/useIsDark';
import { type DiscoverAssistantItem } from '@/types/discover';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  colored: {
    backgroundColor: cssVar.colorFillQuaternary,
    borderRadius: cssVar.borderRadiusLG,
    overflow: 'hidden',
  },
  colored1Base: {
    borderRadius: cssVar.borderRadiusLG,
    boxShadow: '0 4px 8px -2px rgba(0,0,0,.02)',
    overflow: 'hidden',
  },
  flexContainer: {
    flex: 'none',
  },
  style: {
    overflow: 'hidden',
  },
});

const CommunityAgentItem = memo<DiscoverAssistantItem>(
  ({ title, avatar, backgroundColor, author, description }) => {
    const isDarkMode = useIsDark();

    const colored1Style = {
      ...styles.colored1Base,
      backgroundColor: isDarkMode ? cssVar.colorFillQuaternary : cssVar.colorBgContainer,
    };

    return (
      <Block
        clickable
        flex={'none'}
        height={RECENT_BLOCK_SIZE.AGENT.HEIGHT}
        justify={'space-between'}
        style={styles.colored}
        variant={'filled'}
        width={RECENT_BLOCK_SIZE.AGENT.WIDTH}
      >
        <Block flex={1} padding={12} style={colored1Style} variant={'outlined'}>
          <Text color={cssVar.colorTextSecondary} ellipsis={{ rows: 3 }} fontSize={13}>
            {description}
          </Text>
        </Block>
        <Flexbox align={'center'} gap={8} horizontal paddingBlock={8} paddingInline={12}>
          <Flexbox flex={1} gap={1} style={styles.style}>
            <Text ellipsis fontSize={13} weight={500}>
              {title}
            </Text>
            <Text ellipsis fontSize={12} type={'secondary'}>
              {author}
            </Text>
          </Flexbox>
          <Avatar
            avatar={avatar || DEFAULT_AVATAR}
            background={backgroundColor || undefined}
            emojiScaleWithBackground
            shape={'square'}
            size={30}
            style={styles.flexContainer}
          />
        </Flexbox>
      </Block>
    );
  },
);

export default CommunityAgentItem;
