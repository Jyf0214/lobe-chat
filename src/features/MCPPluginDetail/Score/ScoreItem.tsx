import { Flexbox, Icon } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { BanIcon, CircleCheckBigIcon, CircleDashedIcon } from 'lucide-react';
import { type ReactNode, memo } from 'react';

import { StyleSheet } from '@/utils/styles';

import Title from '../../../app/[variants]/(main)/community/features/Title';

const styles = StyleSheet.create({
  spacing: {
    color: cssVar.colorTextSecondary,
    margin: 0,
  },
});

export interface ScoreItemProps {
  check: boolean;
  desc: ReactNode;
  key: string;
  required?: boolean;
  title: ReactNode;
}

const ScoreItem = memo<ScoreItemProps>(({ required, check, desc, title }) => {
  return (
    <Flexbox align={'center'} gap={16} horizontal paddingInline={16}>
      <Icon
        color={
          check ? cssVar.colorSuccess : required ? cssVar.colorError : cssVar.colorTextQuaternary
        }
        icon={check ? CircleCheckBigIcon : required ? BanIcon : CircleDashedIcon}
        size={24}
      />
      <Flexbox gap={4}>
        <Title level={3}>{title}</Title>
        <p style={styles.spacing}>{desc}</p>
      </Flexbox>
    </Flexbox>
  );
});

export default ScoreItem;
