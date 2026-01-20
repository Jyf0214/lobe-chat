import { Flexbox, Icon, createModal, useModalContext } from '@lobehub/ui';
import { BookUp2Icon } from 'lucide-react';
import { Suspense, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet } from '@/utils/styles';

import SelectForm from './SelectForm';

const styles = StyleSheet.create({
  spacing: {
    paddingBottom: 0,
  },
  spacing1: {
    paddingTop: 0,
  },
  style: {
    minHeight: 200,
  },
});

interface AddFilesToKnowledgeBaseModalProps {
  fileIds: string[];
  knowledgeBaseId?: string;
  onClose?: () => void;
}

interface ModalContentProps {
  fileIds: string[];
  knowledgeBaseId?: string;
}

const ModalContent = memo<ModalContentProps>(({ fileIds, knowledgeBaseId }) => {
  const { t } = useTranslation('knowledgeBase');
  const { close } = useModalContext();
  return (
    <>
      <Flexbox gap={8} horizontal paddingBlock={16} paddingInline={16} style={styles.spacing}>
        <Icon icon={BookUp2Icon} />
        {t('addToKnowledgeBase.title')}
      </Flexbox>
      <Flexbox padding={16} style={styles.spacing1}>
        <SelectForm fileIds={fileIds} knowledgeBaseId={knowledgeBaseId} onClose={close} />
      </Flexbox>
    </>
  );
});

ModalContent.displayName = 'AddFilesToKnowledgeBaseModalContent';

export const useAddFilesToKnowledgeBaseModal = () => {
  const open = useCallback((params?: AddFilesToKnowledgeBaseModalProps) => {
    createModal({
      afterClose: params?.onClose,
      children: (
        <Suspense fallback={<div style={styles.style} />}>
          <ModalContent fileIds={params?.fileIds || []} knowledgeBaseId={params?.knowledgeBaseId} />
        </Suspense>
      ),
      footer: null,
      title: null,
    });
  }, []);

  return { open };
};
