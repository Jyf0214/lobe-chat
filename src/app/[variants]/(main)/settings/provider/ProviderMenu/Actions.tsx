import { ActionIcon, DropdownMenu, type MenuProps } from '@lobehub/ui';
import { MoreHorizontalIcon } from 'lucide-react';
import { memo } from 'react';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  flexContainer: {
    flex: 'none',
  },
});

interface ActionsProps {
  dropdownMenu: MenuProps['items'];
}

const Actions = memo<ActionsProps>(({ dropdownMenu }) => {
  return (
    <DropdownMenu items={dropdownMenu}>
      <ActionIcon icon={MoreHorizontalIcon} size={'small'} style={styles.flexContainer} />
    </DropdownMenu>
  );
});

export default Actions;
