'use client';

import { Avatar, Flexbox, Tag } from '@lobehub/ui';
import { type ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_AVATAR } from '@/const/meta';
import NavItem from '@/features/NavPanel/components/NavItem';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  flexContainer: {
    flex: 'none',
  },
  flexContainer1: {
    flexShrink: 0,
  },
  style: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

interface GroupMemberItemProps {
  actions?: ReactNode;
  avatar?: string;
  background?: string;
  isExternal?: boolean;
  onClick?: () => void;
  title: string;
}

const GroupMemberItem = memo<GroupMemberItemProps>(
  ({ title, avatar, background, actions, isExternal }) => {
    const { t } = useTranslation('chat');

    return (
      <NavItem
        actions={actions}
        icon={
          <Avatar
            avatar={avatar || DEFAULT_AVATAR}
            background={background}
            emojiScaleWithBackground
            size={24}
            style={styles.flexContainer}
          />
        }
        title={
          <Flexbox align="center" gap={4} horizontal>
            <span style={styles.style}>{title}</span>
            {isExternal && (
              <Tag size="small" style={styles.flexContainer1}>
                {t('group.profile.external')}
              </Tag>
            )}
          </Flexbox>
        }
      />
    );
  },
);

export default GroupMemberItem;
