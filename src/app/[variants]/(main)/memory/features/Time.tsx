import { Text } from '@lobehub/ui';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  flexContainer: {
    display: 'block',
    flex: 'none',
  },
});

dayjs.extend(relativeTime);

interface TimeProps {
  capturedAt?: Date | number | string;
}

const Time = memo<TimeProps>(({ capturedAt }) => {
  if (!capturedAt) return;

  const datetime = dayjs(capturedAt);

  return (
    <Text
      as={'time'}
      fontSize={12}
      style={styles.flexContainer}
      title={datetime.format('YYYY-MM-DD HH:mm')}
      type={'secondary'}
    >
      {datetime.fromNow()}
    </Text>
  );
});

export default Time;
