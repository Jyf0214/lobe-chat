import { Skeleton } from '@lobehub/ui';

import { useChatStore } from '@/store/chat';
import { StyleSheet } from '@/utils/styles';

import ActiveThread from './Active';
import NewThread from './New';

const styles = StyleSheet.create({
  style: {
    height: 22,
    width: 200,
  },
});

const Header = () => {
  const isInNew = useChatStore((s) => s.startToForkThread);

  const isInit = useChatStore((s) => s.threadsInit);

  if (!isInit) return <Skeleton.Button active size={'small'} style={styles.style} />;

  return isInNew ? <NewThread /> : <ActiveThread />;
};

export default Header;
