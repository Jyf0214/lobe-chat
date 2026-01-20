'use client';

import { isDesktop } from '@lobechat/const';
import { Flexbox } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { memo } from 'react';

import NavHeader from '@/features/NavHeader';
import { StyleSheet } from '@/utils/styles';

import HeaderActions from './HeaderActions';
import NotebookButton from './NotebookButton';
import ShareButton from './ShareButton';
import Tags from './Tags';
import WorkingDirectory from './WorkingDirectory';

const styles = StyleSheet.create({
  colored: {
    backgroundColor: cssVar.colorBgContainer,
  },
});

const Header = memo(() => {
  return (
    <NavHeader
      left={
        <Flexbox style={styles.colored}>
          <Tags />
        </Flexbox>
      }
      right={
        <Flexbox align={'center'} horizontal style={styles.colored}>
          {isDesktop && <WorkingDirectory />}
          <NotebookButton />
          <ShareButton />
          <HeaderActions />
        </Flexbox>
      }
    />
  );
});

export default Header;
