'use client';

import { Block, Center, Grid, type GridProps, Text } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { memo } from 'react';
import useMergeState from 'use-merge-value';

import { useIsDark } from '@/hooks/useIsDark';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  spacing: {
    marginTop: 4,
  },
});

export interface AspectRatioSelectProps extends Omit<GridProps, 'children' | 'onChange'> {
  defaultValue?: string;
  onChange?: (value: string) => void;
  options?: { label?: string; value: string }[];
  value?: string;
}

const AspectRatioSelect = memo<AspectRatioSelectProps>(
  ({ options, onChange, value, defaultValue, ...rest }) => {
    const isDarkMode = useIsDark();
    const [active, setActive] = useMergeState('1:1', {
      defaultValue: defaultValue || '1:1',
      onChange,
      value,
    });

    return (
      <Block padding={4} variant={'filled'} {...rest}>
        <Grid gap={4} maxItemWidth={48} rows={16}>
          {options?.map((item) => {
            const [width, height] = item.value.split(':').map(Number);
            const isWidthGreater = width > height;
            const isActive = active === item.value;

            const coloredStyle = {
              backgroundColor: isActive ? cssVar.colorBgElevated : 'transparent',
            };

            const colored1Style = {
              aspectRatio: `${width} / ${height}`,
              border: `2px solid ${isActive ? cssVar.colorText : cssVar.colorTextDescription}`,
              borderRadius: 3,
              height: isWidthGreater ? undefined : 16,
              width: isWidthGreater ? 16 : undefined,
            };

            return (
              <Block
                align={'center'}
                clickable
                gap={4}
                justify={'center'}
                key={item.value}
                onClick={() => {
                  setActive(item.value);
                  onChange?.(item.value);
                }}
                padding={8}
                shadow={isActive && !isDarkMode}
                style={coloredStyle}
                variant={'filled'}
              >
                <Center height={16} style={styles.spacing} width={16}>
                  <div style={colored1Style} />
                </Center>
                <Text fontSize={12} type={isActive ? undefined : 'secondary'}>
                  {item.label || item.value}
                </Text>
              </Block>
            );
          })}
        </Grid>
      </Block>
    );
  },
);

export default AspectRatioSelect;
