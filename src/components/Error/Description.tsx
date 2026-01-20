'use client';

import { Flexbox, Highlighter, Icon } from '@lobehub/ui';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    cursor: 'pointer',
    fontSize: 12,
  },
});

const Description = memo<{ message: string; status: number }>(({ message, status }) => {
  const { t } = useTranslation('error');
  const [show, setShow] = useState(false);

  const displayStyle = {
    display: show ? undefined : 'none',
    maxHeight: 80,
  };

  return (
    <Flexbox gap={8}>
      {t(`response.${status}` as any)}
      <Flexbox
        gap={4}
        horizontal
        onClick={() => {
          setShow(!show);
        }}
        style={styles.style}
      >
        {t('fetchError.detail')} <Icon icon={show ? ChevronUp : ChevronDown} />
      </Flexbox>
      <Highlighter language={'text'} style={displayStyle}>
        {message}
      </Highlighter>
    </Flexbox>
  );
});

export default Description;
