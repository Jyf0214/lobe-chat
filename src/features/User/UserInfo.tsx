'use client';

import { Flexbox, type FlexboxProps, Text } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { memo } from 'react';

import PlanTag from '@/features/User/PlanTag';
import { useUserStore } from '@/store/user';
import { authSelectors, userProfileSelectors } from '@/store/user/selectors';
import { StyleSheet } from '@/utils/styles';

import UserAvatar, { type UserAvatarProps } from './UserAvatar';

const styles = StyleSheet.create({
  style: {
    lineHeight: 1.4,
  },
});

export interface UserInfoProps extends FlexboxProps {
  avatarProps?: Partial<UserAvatarProps>;
  onClick?: () => void;
}

const UserInfo = memo<UserInfoProps>(({ avatarProps, onClick, ...rest }) => {
  const isSignedIn = useUserStore(authSelectors.isLogin);
  const [nickname, username, subscriptionPlan] = useUserStore((s) => [
    userProfileSelectors.nickName(s),
    userProfileSelectors.displayUserName(s),
    s.subscriptionPlan,
  ]);

  return (
    <Flexbox
      align={'center'}
      gap={12}
      horizontal
      justify={'space-between'}
      paddingBlock={12}
      paddingInline={12}
      {...rest}
    >
      <Flexbox align={'center'} gap={10} horizontal onClick={onClick}>
        <UserAvatar background={cssVar.colorFill} size={36} {...avatarProps} />
        <Flexbox flex={1}>
          <Text style={styles.style} weight={'bold'}>
            {nickname}
          </Text>
          {username && (
            <Text fontSize={12} style={styles.style} type={'secondary'}>
              {username}
            </Text>
          )}
        </Flexbox>
      </Flexbox>
      {isSignedIn && <PlanTag type={subscriptionPlan} />}
    </Flexbox>
  );
});

export default UserInfo;
