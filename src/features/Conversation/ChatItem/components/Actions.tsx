import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

import { type ChatItemProps } from '../type';

const styles = StyleSheet.create({
  flexContainer: {
    alignSelf: 'flex-start',
  },
});

export interface ActionsProps {
  actions: ChatItemProps['actions'];
  placement?: ChatItemProps['placement'];
}

const Actions = memo<ActionsProps>(({ placement, actions }) => {
  const isUser = placement === 'right';
  const flexContainerStyle = {
    ...styles.flexContainer,
    alignSelf: isUser ? 'flex-end' : 'flex-start',
  };
  return (
    <Flexbox
      align={'center'}
      direction={'horizontal'}
      gap={8}
      role="menubar"
      style={flexContainerStyle}
    >
      {actions}
    </Flexbox>
  );
});

export default Actions;
