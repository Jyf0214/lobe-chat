'use client';

import { Flexbox } from '@lobehub/ui';
import { css, cx } from 'antd-style';
import { type PropsWithChildren } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    height: 0,
    position: 'relative',
  },
});

const body = css`
  :has(.portal-artifact) {
    overflow: hidden;
    padding-block-end: 12px;
  }
`;

const Body = ({ children }: PropsWithChildren) => {
  return (
    <Flexbox
      className={cx(body, 'portal-body')}
      height={'100%'}
      style={styles.flexContainer}
      width={'100%'}
    >
      {children}
    </Flexbox>
  );
};

export default Body;
