import { Flexbox } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import numeral from 'numeral';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  colored: {
    background: undefined,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  colored1: {
    color: cssVar.colorTextSecondary,
  },
  flexContainer: {
    background: undefined,
    flex: undefined,
  },
  flexContainer1: {
    background: undefined,
    borderRadius: '50%',
    flex: 'none',
    height: 6,
    width: 6,
  },
  style: {
    position: 'relative',
  },
  style1: {
    fontWeight: 500,
  },
});

export interface TokenProgressItem {
  color: string;
  id: string;
  title: string;
  value: number;
}

interface TokenProgressProps {
  data: TokenProgressItem[];
  showIcon?: boolean;
}

const format = (number: number) => numeral(number).format('0,0');

const TokenProgress = memo<TokenProgressProps>(({ data, showIcon }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <Flexbox gap={8} style={styles.style} width={'100%'}>
      <Flexbox
        height={6}
        horizontal
        style={{ ...styles.colored, background: total === 0 ? cssVar.colorFill : undefined }}
        width={'100%'}
      >
        {data.map((item) => (
          <Flexbox
            height={'100%'}
            key={item.id}
            style={{ ...styles.flexContainer, background: item.color, flex: item.value }}
          />
        ))}
      </Flexbox>
      <Flexbox>
        {data.map((item) => (
          <Flexbox align={'center'} gap={4} horizontal justify={'space-between'} key={item.id}>
            <Flexbox align={'center'} gap={4} horizontal>
              {showIcon && <div style={{ ...styles.flexContainer1, background: item.color }} />}
              <div style={styles.colored1}>{item.title}</div>
            </Flexbox>
            <div style={styles.style1}>{format(item.value)}</div>
          </Flexbox>
        ))}
      </Flexbox>
    </Flexbox>
  );
});

export default TokenProgress;
