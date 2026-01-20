import { Flexbox, createModal, useModalContext } from '@lobehub/ui';
import { Suspense, memo, useCallback } from 'react';

import { StyleSheet } from '@/utils/styles';

import CreateForm from './CreateForm';

const styles = StyleSheet.create({
  spacing: {
    paddingBottom: 16,
  },
  style: {
    minHeight: 200,
  },
});

interface ModalContentProps {
  onSuccess?: (id: string) => void;
}

const ModalContent = memo<ModalContentProps>(({ onSuccess }) => {
  const { close } = useModalContext();

  return (
    <Flexbox paddingInline={16} style={styles.spacing}>
      <CreateForm onClose={close} onSuccess={onSuccess} />
    </Flexbox>
  );
});

ModalContent.displayName = 'KnowledgeBaseCreateModalContent';

export const useCreateNewModal = () => {
  const open = useCallback((props?: { onSuccess?: (id: string) => void }) => {
    createModal({
      children: (
        <Suspense fallback={<div style={styles.style} />}>
          <ModalContent onSuccess={props?.onSuccess} />
        </Suspense>
      ),
      focusTriggerAfterClose: true,
      footer: null,
      title: null,
    });
  }, []);

  return { open };
};
