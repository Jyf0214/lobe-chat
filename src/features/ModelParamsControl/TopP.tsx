import { Flexbox, Icon, SliderWithInput } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { FlowerIcon, TrainFrontTunnel } from 'lucide-react';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  colored: {
    color: cssVar.colorTextQuaternary,
  },
  fullWidth: {
    width: '100%',
  },
  style: {
    height: 42,
  },
});

interface TopPProps {
  disabled?: boolean;
  onChange?: (value: number) => void;
  value?: number;
}

const TopP = memo<TopPProps>(({ value, onChange, disabled }) => {
  return (
    <Flexbox style={styles.fullWidth}>
      <SliderWithInput
        changeOnWheel
        controls={false}
        disabled={disabled}
        marks={{
          0: <Icon icon={TrainFrontTunnel} size={'small'} style={styles.colored} />,
          0.9: <div />,
          1: <Icon icon={FlowerIcon} size={'small'} style={styles.colored} />,
        }}
        max={1}
        min={0}
        onChange={onChange}
        size={'small'}
        step={0.1}
        style={styles.style}
        styles={{
          input: {
            maxWidth: 43,
          },
        }}
        value={value}
      />
    </Flexbox>
  );
});
export default TopP;
