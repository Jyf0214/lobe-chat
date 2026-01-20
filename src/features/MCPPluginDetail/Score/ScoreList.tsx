import { Flexbox } from '@lobehub/ui';
import { Divider } from 'antd';
import { Fragment, memo } from 'react';

import { StyleSheet } from '@/utils/styles';

import ScoreItem, { type ScoreItemProps } from './ScoreItem';

const styles = StyleSheet.create({
  spacing: {
    margin: 0,
  },
});

interface ScoreListProps {
  items: ScoreItemProps[];
}

const ScoreList = memo<ScoreListProps>(({ items }) => {
  return (
    <Flexbox gap={16} paddingBlock={16}>
      {items.map((item, index) => (
        <Fragment key={item.key}>
          <ScoreItem {...item} key={item.key} />
          {index < items.length - 1 && <Divider style={styles.spacing} />}
        </Fragment>
      ))}
    </Flexbox>
  );
});

export default ScoreList;
