import { BarChart, type BarChartProps, ChartTooltipFrame, ChartTooltipRow } from '@lobehub/charts';
import { Flexbox, Text } from '@lobehub/ui';
import { Divider } from 'antd';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  flexContainer: {
    flexDirection: 'column-reverse',
    marginTop: 4,
  },
  spacing: {
    margin: 0,
  },
  style: {
    fontWeight: 'bold',
  },
});

export const UsageBarChart = ({ ...props }: BarChartProps) => (
  <BarChart
    {...props}
    customTooltip={({ active, payload, label, valueFormatter }) => {
      if (active && payload) {
        return (
          <ChartTooltipFrame>
            <Flexbox horizontal justify={'space-between'} paddingBlock={8} paddingInline={16}>
              <Text as={'p'} ellipsis style={styles.spacing}>
                {label}
              </Text>
              <span style={styles.style}>
                {payload.reduce((acc: number, cur: any) => acc + cur.value, 0)}
              </span>
            </Flexbox>
            <Divider style={styles.spacing} />
            <Flexbox gap={4} paddingBlock={8} paddingInline={16} style={styles.flexContainer}>
              {payload.map(({ value, color, name }: any, idx: number) =>
                typeof value === 'number' && value > 0 ? (
                  <ChartTooltipRow
                    color={color}
                    key={`id-${idx}`}
                    name={name}
                    value={(valueFormatter as any)?.(value)}
                  />
                ) : null,
              )}
            </Flexbox>
          </ChartTooltipFrame>
        );
      }
      return null;
    }}
  />
);
