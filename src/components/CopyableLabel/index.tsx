import { CopyButton, Flexbox, Text } from '@lobehub/ui';
import { type CSSProperties, memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  fullWidth: {
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    margin: 0,
    overflow: 'hidden',
    width: '100%',
  },
  style: {
    overflow: 'hidden',
    position: 'relative',
  },
});

interface CopyableLabelProps {
  className?: string;
  style?: CSSProperties;
  value?: string | null;
}

const CopyableLabel = memo<CopyableLabelProps>(({ className, style, value = '--' }) => {
  return (
    <Flexbox
      align={'center'}
      className={className}
      gap={4}
      horizontal
      style={StyleSheet.compose(styles.style, style)}
    >
      <Text ellipsis style={styles.fullWidth}>
        {value || '--'}
      </Text>
      <CopyButton content={value || '--'} size={'small'} />
    </Flexbox>
  );
});

export default CopyableLabel;
