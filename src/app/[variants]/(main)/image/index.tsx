'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';
import { StyleSheet } from '@/utils/styles';

import ImageWorkspace from './features/ImageWorkspace';

const styles = StyleSheet.create({
  style: {
    overflowY: 'auto',
    position: 'relative',
  },
});

const DesktopImagePage = memo(() => {
  return (
    <>
      <NavHeader right={<WideScreenButton />} />
      <Flexbox height={'100%'} style={styles.style} width={'100%'}>
        <WideScreenContainer height={'100%'} wrapperStyle={{ height: '100%' }}>
          <ImageWorkspace />
        </WideScreenContainer>
      </Flexbox>
    </>
  );
});

DesktopImagePage.displayName = 'DesktopImagePage';

export default DesktopImagePage;
