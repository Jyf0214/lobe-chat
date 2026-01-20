import { Flexbox, Icon, SliderWithInput } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { BookOpenText, FileIcon } from 'lucide-react';
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

interface FrequencyPenaltyProps {
  disabled?: boolean;
  onChange?: (value: number) => void;
  value?: number;
}

const FrequencyPenalty = memo<FrequencyPenaltyProps>(({ value, onChange, disabled }) => {
  return (
    <Flexbox style={styles.fullWidth}>
      <SliderWithInput
        changeOnWheel
        controls={false}
        disabled={disabled}
        marks={{
          '-2': <Icon icon={FileIcon} size={'small'} style={styles.colored} />,
          0: <div />,
          2: <Icon icon={BookOpenText} size={'small'} style={styles.colored} />,
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
export default FrequencyPenalty;
