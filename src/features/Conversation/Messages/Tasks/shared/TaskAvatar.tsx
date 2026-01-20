import { Block, Flexbox, Icon } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { ListTodo } from 'lucide-react';
import { FC, PropsWithChildren } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    position: 'relative',
  },
  style1: {
    borderRadius: 4,
    position: 'absolute',
    right: -4,
    top: -4,
  },
});

const TaskAvatar: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Flexbox flex={'none'} height={28} style={styles.style} width={28}>
      {children}
      <Block
        align={'center'}
        flex={'none'}
        height={16}
        justify={'center'}
        style={styles.style1}
        variant={'outlined'}
        width={16}
      >
        <Icon color={cssVar.colorTextDescription} icon={ListTodo} size={10} />
      </Block>
    </Flexbox>
  );
};

export default TaskAvatar;
