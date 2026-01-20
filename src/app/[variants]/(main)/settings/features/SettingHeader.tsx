import { Flexbox, Text } from '@lobehub/ui';
import { Divider } from 'antd';
import { FC, ReactNode } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  spacing: {
    paddingTop: 12,
  },
  spacing1: {
    margin: 0,
  },
});

interface SettingHeaderProps {
  title: ReactNode;
}

const SettingHeader: FC<SettingHeaderProps> = ({ title }) => {
  return (
    <Flexbox gap={24} style={styles.spacing}>
      <Text fontSize={24} strong>
        {title}
      </Text>
      <Divider style={styles.spacing1} />
    </Flexbox>
  );
};

export default SettingHeader;
