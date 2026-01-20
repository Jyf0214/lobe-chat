import { ActionIcon, Flexbox } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { ArrowLeftRight, XIcon } from 'lucide-react';
import { memo } from 'react';

import NavHeader from '@/features/NavHeader';
import { useChatStore } from '@/store/chat';
import { StyleSheet } from '@/utils/styles';

import Title from './Title';

const styles = StyleSheet.create({
  colored: {
    borderBottom: `1px solid ${cssVar.colorBorderSecondary}`,
  },
});

const Header = memo(() => {
  const [hasPortal, portalThreadId, closeThreadPortal, switchThread] = useChatStore((s) => [
    !!s.portalThreadId,
    s.portalThreadId,
    s.closeThreadPortal,
    s.switchThread,
  ]);

  return (
    <NavHeader
      left={<Title />}
      paddingBlock={6}
      paddingInline={8}
      right={
        <Flexbox gap={4} horizontal>
          {hasPortal && (
            <ActionIcon
              icon={ArrowLeftRight}
              onClick={() => {
                if (!portalThreadId) return;

                switchThread(portalThreadId);
                closeThreadPortal();
              }}
              size={'small'}
            />
          )}
          <ActionIcon icon={XIcon} onClick={closeThreadPortal} size={'small'} />
        </Flexbox>
      }
      showTogglePanelButton={false}
      style={styles.colored}
    />
  );
});

export default Header;
