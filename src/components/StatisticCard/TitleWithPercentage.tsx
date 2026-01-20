import { Flexbox, Tag, Text } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { type CSSProperties, memo } from 'react';

import { StyleSheet } from '@/utils/styles';

import { calcGrowthPercentage } from './growthPercentage';

const styles = StyleSheet.create({
  spacing: {
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    margin: 0,
    overflow: 'hidden',
  },
  style: {
    overflow: 'hidden',
    position: 'inherit',
  },
});

interface TitleWithPercentageProps {
  count?: number;
  inverseColor?: boolean;
  prvCount?: number;
  title: string;
}

const TitleWithPercentage = memo<TitleWithPercentageProps>(
  ({ inverseColor, title, prvCount, count }) => {
    const percentage = calcGrowthPercentage(count || 0, prvCount || 0);

    const upStyle: CSSProperties = {
      color: cssVar.colorSuccess,
    };

    const downStyle: CSSProperties = {
      color: cssVar.colorWarning,
    };

    const tagStyle = inverseColor
      ? percentage > 0
        ? downStyle
        : upStyle
      : percentage > 0
        ? upStyle
        : downStyle;

    return (
      <Flexbox align={'center'} gap={4} horizontal justify={'flex-start'} style={styles.style}>
        <Text as={'h2'} ellipsis={{ rows: 1, tooltip: title }} style={styles.spacing}>
          {title}
        </Text>
        {count && prvCount && percentage && percentage !== 0 ? (
          <Tag style={tagStyle} variant={'borderless'}>
            {percentage > 0 ? '+' : ''}
            {percentage.toFixed(1)}%
          </Tag>
        ) : null}
      </Flexbox>
    );
  },
);

export default TitleWithPercentage;
