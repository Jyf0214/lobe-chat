import { Center, Checkbox, Flexbox, Skeleton } from '@lobehub/ui';
import { cssVar } from 'antd-style';

import { StyleSheet } from '@/utils/styles';

import { FILE_DATE_WIDTH, FILE_SIZE_WIDTH } from './ListItem';

const styles = StyleSheet.create({
  colored: {
    background: undefined,
    borderBlockEnd: `1px solid ${cssVar.colorBorderSecondary}`,
    opacity: undefined,
  },
  flexContainer: {
    flexShrink: 0,
    maxWidth: 400,
    minWidth: 400,
    paddingInline: 8,
    width: 400,
  },
  flexContainer1: {
    flexShrink: 0,
    paddingInline: '0 24px',
  },
  spacing: {
    paddingInline: 4,
  },
  spacing1: {
    marginInline: 8,
  },
  style: {
    height: 16,
    width: '60%',
  },
  style1: {
    height: 16,
    width: '80%',
  },
});

interface ListViewSkeletonProps {
  columnWidths?: {
    date: number;
    name: number;
    size: number;
  };
  count?: number;
}

const ListViewSkeleton = ({
  columnWidths = { date: FILE_DATE_WIDTH, name: 400, size: FILE_SIZE_WIDTH },
  count = 6,
}: ListViewSkeletonProps) => {
  // Calculate opacity gradient from 100% to 20%
  const getOpacity = (index: number) => 1 - (index / (count - 1)) * 0.8;

  return (
    <Flexbox>
      {Array.from({ length: count }).map((_, index) => (
        <Flexbox
          align={'center'}
          height={48}
          horizontal
          key={index}
          paddingInline={8}
          style={{
            ...styles.colored,
            background: index % 2 === 0 ? cssVar.colorFillQuaternary : 'transparent',
            opacity: getOpacity(index),
          }}
        >
          <Center height={40} style={styles.spacing}>
            <Checkbox disabled />
          </Center>
          <Flexbox
            align={'center'}
            horizontal
            style={{
              ...styles.flexContainer,
              maxWidth: columnWidths.name,
              minWidth: columnWidths.name,
              width: columnWidths.name,
            }}
          >
            <Skeleton.Avatar active shape={'square'} size={24} style={styles.spacing1} />
            <Skeleton.Button active style={styles.style} />
          </Flexbox>
          <Flexbox style={styles.flexContainer1} width={columnWidths.date}>
            <Skeleton.Button active style={styles.style1} />
          </Flexbox>
          <Flexbox style={styles.flexContainer1} width={columnWidths.size}>
            <Skeleton.Button active style={styles.style} />
          </Flexbox>
        </Flexbox>
      ))}
    </Flexbox>
  );
};

export default ListViewSkeleton;
