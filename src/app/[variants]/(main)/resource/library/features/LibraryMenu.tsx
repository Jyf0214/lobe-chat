'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import LibraryHierarchy from '@/features/ResourceManager/components/LibraryHierarchy';
import { StyleSheet } from '@/utils/styles';

import Head from '../_layout/Header/LibraryHead';

const styles = StyleSheet.create({
  spacing: {
    paddingTop: 12,
  },
});

const Menu = memo<{ id: string }>(({ id }) => {
  return (
    <Flexbox gap={16} height={'100%'} style={styles.spacing}>
      <Flexbox paddingInline={12}>
        <Head id={id} />
      </Flexbox>
      <LibraryHierarchy />
    </Flexbox>
  );
});

Menu.displayName = 'Menu';

export default Menu;
