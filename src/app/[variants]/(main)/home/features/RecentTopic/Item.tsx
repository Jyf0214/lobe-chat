import { Avatar, Block, Center, Flexbox, Text } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { memo, useMemo } from 'react';

import Time from '@/app/[variants]/(main)/home/features/components/Time';
import { RECENT_BLOCK_SIZE } from '@/app/[variants]/(main)/home/features/const';
import { DEFAULT_AVATAR } from '@/const/meta';
import GroupAvatar from '@/features/GroupAvatar';
import { type RecentTopic } from '@/types/topic';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  colored: {
    background: cssVar.colorFillTertiary,
    overflow: 'hidden',
  },
  colored1: {
    background: cssVar.colorBgLayout,
  },
  spacing: {
    marginTop: -28,
  },
  style: {
    borderRadius: cssVar.borderRadiusLG,
    overflow: 'hidden',
  },
  style1: {
    filter: 'blur(100px)',
  },
  style2: {
    lineHeight: 1.4,
  },
});

const ReactTopicItem = memo<RecentTopic>(({ title, updatedAt, agent, group, type }) => {
  const isGroup = type === 'group';

  // For group topics, get the first member's background for blur effect
  const blurBackground = isGroup ? group?.members?.[0]?.backgroundColor : agent?.backgroundColor;

  // Build group avatars for GroupAvatar component
  const groupAvatars = useMemo(() => {
    if (!isGroup || !group?.members) return [];
    return group.members.map((member) => ({
      avatar: member.avatar || DEFAULT_AVATAR,
      background: member.backgroundColor || undefined,
      style: { borderRadius: 3 },
    }));
  }, [isGroup, group?.members]);

  // Display title - group title or agent title
  const displayTitle = isGroup ? group?.title : agent?.title;

  return (
    <Block
      clickable
      flex={'none'}
      height={RECENT_BLOCK_SIZE.TOPIC.HEIGHT}
      style={styles.style}
      variant={'outlined'}
      width={RECENT_BLOCK_SIZE.TOPIC.WIDTH}
    >
      <Center flex={'none'} height={44} style={styles.colored}>
        <Avatar
          avatar={
            isGroup
              ? group?.members?.[0]?.avatar || DEFAULT_AVATAR
              : agent?.avatar || DEFAULT_AVATAR
          }
          background={blurBackground || undefined}
          emojiScaleWithBackground
          shape={'square'}
          size={200}
          style={styles.style1}
        />
      </Center>
      <Flexbox flex={1} gap={6} justify={'space-between'} padding={12}>
        <Flexbox gap={6} style={styles.spacing}>
          {isGroup ? (
            <GroupAvatar avatars={groupAvatars} size={30} style={styles.colored1} />
          ) : (
            <Avatar
              avatar={agent?.avatar || DEFAULT_AVATAR}
              background={agent?.backgroundColor || undefined}
              emojiScaleWithBackground
              shape={'square'}
              size={30}
              title={agent?.title || undefined}
            />
          )}
          <Text ellipsis={{ rows: 2 }} style={styles.style2} weight={500}>
            {title}
          </Text>
        </Flexbox>
        <Flexbox align={'center'} gap={8} horizontal>
          <Time date={updatedAt} />
          <Text ellipsis fontSize={12} type={'secondary'}>
            {displayTitle}
          </Text>
        </Flexbox>
      </Flexbox>
    </Block>
  );
});

export default ReactTopicItem;
