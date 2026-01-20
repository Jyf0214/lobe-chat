'use client';

import { Avatar, Flexbox, Modal } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet } from '@/utils/styles';

import type { OriginalGroupInfo } from './types';

const styles = StyleSheet.create({
  flexContainer: {
    flex: 'none',
  },
  spacing: {
    marginTop: 16,
  },
  spacing1: {
    lineHeight: 1.6,
    margin: 0,
  },
  style: {
    fontWeight: 500,
  },
  style1: {
    fontSize: 12,
    opacity: 0.6,
  },
});

interface GroupForkConfirmModalProps {
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  originalGroup: OriginalGroupInfo | null;
}

const GroupForkConfirmModal = memo<GroupForkConfirmModalProps>(
  ({ open, onCancel, onConfirm, originalGroup, loading }) => {
    const { t } = useTranslation('setting');

    if (!originalGroup) return null;

    const authorName = originalGroup.author?.name || originalGroup.author?.userName || 'Unknown';

    return (
      <Modal
        cancelText={t('cancel', { ns: 'common' })}
        centered
        closable
        confirmLoading={loading}
        okText={t('marketPublish.forkConfirm.confirmGroup')}
        onCancel={onCancel}
        onOk={onConfirm}
        open={open}
        title={t('marketPublish.forkConfirm.titleGroup')}
        width={480}
      >
        <Flexbox gap={16} style={styles.spacing}>
          <Flexbox align="center" gap={12} horizontal>
            <Avatar avatar={originalGroup.avatar} size={48} style={styles.flexContainer} />
            <Flexbox gap={4}>
              <div style={styles.style}>{originalGroup.name}</div>
              <div style={styles.style1}>
                {t('marketPublish.forkConfirm.by', { author: authorName })}
              </div>
            </Flexbox>
          </Flexbox>

          <p style={styles.spacing1}>{t('marketPublish.forkConfirm.descriptionGroup')}</p>
        </Flexbox>
      </Modal>
    );
  },
);

GroupForkConfirmModal.displayName = 'GroupForkConfirmModal';

export default GroupForkConfirmModal;
