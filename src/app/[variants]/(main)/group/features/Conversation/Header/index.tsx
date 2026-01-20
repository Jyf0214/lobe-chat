'use client';

import { Flexbox } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { Suspense, memo } from 'react';

import NavHeader from '@/features/NavHeader';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';
import { StyleSheet } from '@/utils/styles';

import ShareButton from './ShareButton';

const styles = StyleSheet.create({
  colored: {
    backgroundColor: cssVar.colorBgContainer,
  },
});

const Header = memo(() => {
  return (
    <NavHeader
      right={
        <Flexbox horizontal style={styles.colored}>
          <WideScreenButton />
          <Suspense>
            <ShareButton />
          </Suspense>
        </Flexbox>
      }
    />
  );
});

export default Header;
