import { Flexbox, Tag } from '@lobehub/ui';
import { type ReactNode, memo } from 'react';

import { StyleSheet } from '@/utils/styles';

import Title from '../../../../../features/Title';

const styles = StyleSheet.create({
  spacing: {
    marginBottom: 24,
  },
});

interface BlockProps {
  children?: ReactNode;
  count: number;
  desc: string;
  id?: string;
  title: string;
}

const Block = memo<BlockProps>(({ title, count, desc, children, id }) => {
  return (
    <Flexbox gap={8}>
      <Title id={id} tag={<Tag>{count}</Tag>}>
        {title}
      </Title>
      <p style={styles.spacing}>{desc}</p>
      {children}
    </Flexbox>
  );
});

export default Block;
