import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import NavItem from '@/features/NavPanel/components/NavItem';
import { StyleSheet } from '@/utils/styles';

import Actions from './Actions';
import { useDropdownMenu } from './useDropdownMenu';

const styles = StyleSheet.create({
  flexContainer: {
    flexShrink: 0,
  },
});

interface TopicItemProps {
  active: boolean;
  onClose: () => void;
  onTopicChange: (topicId: string) => void;
  topicId: string;
  topicTitle: string;
}

const TopicItem = memo<TopicItemProps>(
  ({ active, onClose, onTopicChange, topicId, topicTitle }) => {
    const { t } = useTranslation('topic');

    const dropdownMenu = useDropdownMenu({
      onClose,
      topicId,
      topicTitle,
    });

    return (
      <NavItem
        actions={<Actions dropdownMenu={dropdownMenu} />}
        active={active}
        contextMenuItems={dropdownMenu}
        onClick={() => {
          onTopicChange(topicId);
          onClose();
        }}
        style={styles.flexContainer}
        title={topicTitle || t('untitled', { defaultValue: 'Untitled' })}
      />
    );
  },
);

export default TopicItem;
