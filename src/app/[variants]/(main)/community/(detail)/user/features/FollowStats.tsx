'use client';

import { Flexbox, Text } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet } from '@/utils/styles';

import { useUserDetailContext } from './DetailProvider';

const styles = StyleSheet.create({
  style: {
    fontWeight: 600,
  },
});

const FollowStats = memo(() => {
  const { t } = useTranslation('discover');
  const { user } = useUserDetailContext();

  console.log(user);

  const followingCount = user.followingCount ?? 0;
  const followersCount = user.followersCount ?? 0;

  return (
    <Flexbox align={'center'} gap={16} horizontal>
      <Flexbox align={'center'} gap={8} horizontal>
        <Text style={styles.style}>{followingCount}</Text>
        <Text type={'secondary'}>{t('user.following')}</Text>
      </Flexbox>
      <Flexbox align={'center'} gap={8} horizontal>
        <Text style={styles.style}>{followersCount}</Text>
        <Text type={'secondary'}>{t('user.followers')}</Text>
      </Flexbox>
    </Flexbox>
  );
});

export default FollowStats;
