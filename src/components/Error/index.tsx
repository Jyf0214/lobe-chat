'use client';

import { Button, Flexbox, FluentEmoji } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { MAX_WIDTH } from '@/const/layoutTokens';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  fullWidth: {
    minHeight: '100%',
    width: '100%',
  },
  spacing: {
    filter: 'blur(8px)',
    fontSize: `min(${MAX_WIDTH / 6}px, 25vw)`,
    fontWeight: 900,
    margin: 0,
    opacity: 0.12,
    position: 'absolute',
    zIndex: 0,
  },
  spacing1: {
    fontWeight: 'bold',
    marginTop: '1em',
    textAlign: 'center',
  },
  spacing2: {
    marginBottom: '2em',
  },
  spacing3: {
    marginBottom: '1em',
  },
});

export type ErrorType = Error & { digest?: string };

interface ErrorCaptureProps {
  error: ErrorType;
  reset: () => void;
}

const ErrorCapture = memo<ErrorCaptureProps>(({ reset }) => {
  const { t } = useTranslation('error');

  return (
    <Flexbox align={'center'} justify={'center'} style={styles.fullWidth}>
      <h1 style={styles.spacing}>ERROR</h1>
      <FluentEmoji emoji={'🤧'} size={64} />
      <h2 style={styles.spacing1}>{t('error.title')}</h2>
      <p style={styles.spacing2}>{t('error.desc')}</p>
      <Flexbox gap={12} horizontal style={styles.spacing3}>
        <Button onClick={() => reset()}>{t('error.retry')}</Button>
        <Button onClick={() => (window.location.href = '/')} type={'primary'}>
          {t('error.backHome')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
});

ErrorCapture.displayName = 'ErrorCapture';

export default ErrorCapture;
