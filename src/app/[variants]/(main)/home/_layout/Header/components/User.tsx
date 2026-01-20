'use client';

import { Block, Flexbox, Icon, Text } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { ChevronDownIcon } from 'lucide-react';
import { memo } from 'react';

import { ProductLogo } from '@/components/Branding';
import UserAvatar from '@/features/User/UserAvatar';
import UserPanel from '@/features/User/UserPanel';
import { useUserStore } from '@/store/user';
import { authSelectors, userProfileSelectors } from '@/store/user/selectors';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  spacingBase: {
    minWidth: 32,
    overflow: 'hidden',
    paddingInlineStart: 2,
  },
  style: {
    overflow: 'hidden',
  },
});

export const USER_DROPDOWN_ICON_ID = 'user-dropdown-icon';

const User = memo<{ lite?: boolean }>(({ lite }) => {
  const [nickname, username, isSignedIn] = useUserStore((s) => [
    userProfileSelectors.nickName(s),
    userProfileSelectors.username(s),
    authSelectors.isLogin(s),
  ]);

  const spacingStyle = {
    ...styles.spacingBase,
    paddingInlineEnd: lite ? 2 : 8,
  };

  return (
    <UserPanel>
      <Block
        align={'center'}
        clickable
        gap={8}
        horizontal
        paddingBlock={2}
        style={spacingStyle}
        variant={'borderless'}
      >
        <UserAvatar shape={'square'} size={28} />
        {!lite && (
          <Flexbox align={'center'} gap={4} horizontal style={styles.style}>
            {!isSignedIn && (nickname || username) ? (
              <ProductLogo color={cssVar.colorText} size={28} type={'text'} />
            ) : (
              <Text ellipsis style={styles.flexContainer} weight={500}>
                {nickname || username}
              </Text>
            )}
            <Icon
              color={cssVar.colorTextDescription}
              icon={ChevronDownIcon}
              id={USER_DROPDOWN_ICON_ID}
            />
          </Flexbox>
        )}
      </Block>
    </UserPanel>
  );
});

export default User;
