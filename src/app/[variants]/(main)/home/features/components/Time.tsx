import { Text } from '@lobehub/ui';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  flexContainer: {
    flex: 'none',
  },
});

dayjs.extend(relativeTime);

export const Time = memo<{ date: string | number | Date }>(({ date }) => {
  return (
    <Text fontSize={12} style={styles.flexContainer} type={'secondary'}>
      {dayjs(date || dayjs().date()).fromNow()}
    </Text>
  );
});

export default Time;
