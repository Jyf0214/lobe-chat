import { Divider } from 'antd';
import { type PropsWithChildren, memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  spacing: {
    margin: '0 0 8px 0',
  },
});

const ExtraContainer = memo<PropsWithChildren>(({ children }) => {
  return (
    <div>
      <Divider style={styles.spacing} />
      {children}
    </div>
  );
});

export default ExtraContainer;
