'use client';

import { Block, Center, Grid, type GridProps, Select, Text } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { type ReactNode, memo } from 'react';
import useMergeState from 'use-merge-value';

import { useIsDark } from '@/hooks/useIsDark';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  coloredBase: {
    borderRadius: 3,
    height: 16,
    width: 16,
  },
  fullWidth: {
    width: '100%',
  },
  spacing: {
    marginTop: 4,
  },
});

export interface SizeSelectProps extends Omit<GridProps, 'children' | 'onChange'> {
  defaultValue?: 'auto' | string;
  onChange?: (value: string) => void;
  options?: { label?: string; value: 'auto' | string }[];
  value?: 'auto' | string;
}

/**
 * Check if a size value can be parsed as valid aspect ratio
 */
const canParseAsRatio = (value: string): boolean => {
  if (value === 'auto') return true;

  const parts = value.split('x');
  if (parts.length !== 2) return false;

  const [width, height] = parts.map(Number);
  return !isNaN(width) && !isNaN(height) && width > 0 && height > 0;
};

const SizeSelect = memo<SizeSelectProps>(({ options, onChange, value, defaultValue, ...rest }) => {
  const isDarkMode = useIsDark();
  const [active, setActive] = useMergeState('auto', {
    defaultValue,
    onChange,
    value,
  });

  // Check if all options can be parsed as valid ratios
  const hasInvalidRatio = options?.some((item) => !canParseAsRatio(item.value));

  // If any option cannot be parsed as ratio, fallback to regular Select
  if (hasInvalidRatio) {
    return <Select onChange={onChange} options={options} style={styles.fullWidth} value={active} />;
  }
  return (
    <Block padding={4} variant={'filled'} {...rest}>
      <Grid gap={4} maxItemWidth={72} rows={16}>
        {options?.map((item) => {
          const isActive = active === item.value;
          let content: ReactNode;

          if (item.value === 'auto') {
            const coloredStyle = {
              ...styles.coloredBase,
              border: `2px dashed ${isActive ? cssVar.colorText : cssVar.colorTextDescription}`,
            };
            content = <div style={coloredStyle} />;
          } else {
            const [width, height] = item.value.split('x').map(Number);
            const isWidthGreater = width > height;
            const colored1Style = {
              aspectRatio: `${width} / ${height}`,
              border: `2px solid ${isActive ? cssVar.colorText : cssVar.colorTextDescription}`,
              borderRadius: 3,
              height: isWidthGreater ? undefined : 16,
              width: isWidthGreater ? 16 : undefined,
            };
            content = <div style={colored1Style} />;
          }

          const colored2Style = {
            backgroundColor: isActive ? cssVar.colorBgElevated : 'transparent',
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
              style={colored2Style}
              variant={'filled'}
            >
              <Center height={16} style={styles.spacing} width={16}>
                {content}
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
});

export default SizeSelect;
