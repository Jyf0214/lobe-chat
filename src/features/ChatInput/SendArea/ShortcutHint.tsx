import { Flexbox, Hotkey, Text, combineKeys } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';
import { KeyEnum } from '@/types/hotkey';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  colored: {
    color: cssVar.colorTextQuaternary,
    userSelect: 'none',
    zIndex: 1,
  },
  colored1: {
    color: 'inherit',
  },
});

const ShortcutHint = memo(() => {
  const { t } = useTranslation('chat');

  const useCmdEnterToSend = useUserStore(preferenceSelectors.useCmdEnterToSend);

  const sendShortcut = useCmdEnterToSend
    ? combineKeys([KeyEnum.Mod, KeyEnum.Enter])
    : KeyEnum.Enter;

  const wrapperShortcut = useCmdEnterToSend
    ? KeyEnum.Enter
    : combineKeys([KeyEnum.Mod, KeyEnum.Enter]);

  return (
    <Text fontSize={12} style={styles.colored}>
      <Flexbox align={'center'} gap={4} horizontal justify={'flex-end'} paddingBlock={4}>
        <Hotkey
          keys={sendShortcut}
          style={styles.colored1}
          styles={{
            kbdStyle: { color: 'inherit' },
          }}
          variant={'borderless'}
        />
        <span>{t('input.send')}</span>
        <span>/</span>
        <Hotkey
          keys={wrapperShortcut}
          style={styles.colored1}
          styles={{
            kbdStyle: { color: 'inherit' },
          }}
          variant={'borderless'}
        />
        <span>{t('input.warp')}</span>
      </Flexbox>
    </Text>
  );
});

export default ShortcutHint;
