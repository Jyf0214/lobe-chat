'use client';

import { Flexbox } from '@lobehub/ui';
import { type FC, type PropsWithChildren } from 'react';

import NavHeader from '@/features/NavHeader';
import SettingContainer from '@/features/Setting/SettingContainer';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    minHeight: '100%',
  },
});

const Container: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Flexbox height={'100%'} width={'100%'}>
      <NavHeader />
      <SettingContainer maxWidth={1024} padding={24} style={styles.style}>
        {children}
      </SettingContainer>
    </Flexbox>
  );
};
export default Container;
