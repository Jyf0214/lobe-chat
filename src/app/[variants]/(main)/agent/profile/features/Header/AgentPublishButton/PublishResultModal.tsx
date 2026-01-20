'use client';

import { FluentEmoji, Modal, Text } from '@lobehub/ui';
import { Result } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  fullWidth: {
    paddingBottom: 32,
    paddingTop: 48,
    width: '100%',
  },
});

interface PublishResultModalProps {
  identifier?: string;
  onCancel: () => void;
  open: boolean;
}

const PublishResultModal = memo<PublishResultModalProps>(({ identifier, onCancel, open }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('setting');
  const { t: tCommon } = useTranslation('common');

  const handleGoToMarket = () => {
    if (identifier) {
      navigate(`/community/agent/${identifier}`);
    }
    onCancel();
  };

  return (
    <Modal
      cancelText={tCommon('cancel')}
      centered
      okText={t('marketPublish.resultModal.view')}
      onCancel={onCancel}
      onOk={handleGoToMarket}
      open={open}
      title={null}
      width={440}
    >
      <Result
        icon={<FluentEmoji emoji={'🎉'} size={96} type={'anim'} />}
        style={styles.fullWidth}
        subTitle={
          <Text fontSize={14} type={'secondary'}>
            {t('marketPublish.resultModal.message')}
          </Text>
        }
        title={
          <Text fontSize={28} weight={'bold'}>
            {t('marketPublish.resultModal.title')}
          </Text>
        }
      />
    </Modal>
  );
});

export default PublishResultModal;
