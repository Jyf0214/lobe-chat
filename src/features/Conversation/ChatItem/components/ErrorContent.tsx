import { Alert, Skeleton } from '@lobehub/ui';
import { Button } from 'antd';
import { RotateCcw } from 'lucide-react';
import { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useConversationStore } from '@/features/Conversation';
import { StyleSheet } from '@/utils/styles';

import { type ChatItemProps } from '../type';

const styles = StyleSheet.create({
  fullWidth: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
});

export interface ErrorContentProps {
  customErrorRender?: ChatItemProps['customErrorRender'];
  error: ChatItemProps['error'];
  id?: string;
  onRegenerate?: () => void;
}

const ErrorContent = memo<ErrorContentProps>(({ customErrorRender, error, id, onRegenerate }) => {
  const { t } = useTranslation('common');
  const [deleteMessage] = useConversationStore((s) => [s.deleteMessage]);

  if (!error) return;

  if (customErrorRender) {
    return (
      <Suspense fallback={<Skeleton.Button active block />}>{customErrorRender(error)}</Suspense>
    );
  }

  const fullWidthStyle = {
    ...styles.fullWidth,
    ...error?.style,
  };

  return (
    <Alert
      action={
        onRegenerate && (
          <Button
            color="default"
            icon={<RotateCcw size={14} />}
            onClick={onRegenerate}
            size="small"
            variant="filled"
          >
            {t('regenerate')}
          </Button>
        )
      }
      closable
      extraDefaultExpand
      extraIsolate={false}
      showIcon
      type={'secondary'}
      {...error}
      afterClose={() => {
        error?.afterClose?.();
        if (id) {
          deleteMessage(id);
        }
      }}
      style={fullWidthStyle}
      title={error.message}
    />
  );
});

export default ErrorContent;
