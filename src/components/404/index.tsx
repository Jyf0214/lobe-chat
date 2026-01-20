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
    fontSize: `min(${MAX_WIDTH / 3}px, 50vw)`,
    fontWeight: 'bolder',
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
    lineHeight: '1.8',
    marginBottom: '2em',
    textAlign: 'center',
  },
  spacing3: {
    marginTop: '0.5em',
  },
});

const NotFound = memo(() => {
  const { t } = useTranslation('error');
  return (
    <Flexbox align={'center'} justify={'center'} style={styles.fullWidth}>
      <h1 style={styles.spacing}>404</h1>
      <FluentEmoji emoji={'👀'} size={64} />
      <h2 style={styles.spacing1}>{t('notFound.title')}</h2>
      <div style={styles.spacing2}>
        <div>{t('notFound.desc')}</div>
        <div style={styles.spacing3}>{t('notFound.check')}</div>
      </div>

      <Button onClick={() => (window.location.href = '/')} type={'primary'}>
        {t('notFound.backHome')}
      </Button>
    </Flexbox>
  );
});

NotFound.displayName = 'NotFound';

export default NotFound;
