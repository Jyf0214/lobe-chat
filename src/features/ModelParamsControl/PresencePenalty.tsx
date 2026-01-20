import { Flexbox, Icon, SliderWithInput } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { AtomIcon, RepeatIcon } from 'lucide-react';
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

interface PresencePenaltyProps {
  disabled?: boolean;
  onChange?: (value: number) => void;
  value?: number;
}

const PresencePenalty = memo<PresencePenaltyProps>(({ value, onChange, disabled }) => {
  return (
    <Flexbox style={styles.fullWidth}>
      <SliderWithInput
        changeOnWheel
        controls={false}
        disabled={disabled}
        marks={{
          '-2': <Icon icon={RepeatIcon} size={'small'} style={styles.colored} />,
          0: <div />,
          2: <Icon icon={AtomIcon} size={'small'} style={styles.colored} />,
        }}
        max={2}
        min={-2}
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
export default PresencePenalty;
