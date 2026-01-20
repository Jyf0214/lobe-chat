'use client';

import { ModelTag, ProviderIcon } from '@lobehub/icons';
import { Flexbox, Tag } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import urlJoin from 'url-join';

import { OFFICIAL_URL } from '@/const/url';
import { StyleSheet } from '@/utils/styles';

import ShareButton from '../../../../features/ShareButton';
import { useDetailContext } from '../../DetailProvider';
import ProviderConfig from './ProviderConfig';

const styles = StyleSheet.create({
  spacing: {
    margin: 0,
  },
});

const ActionButton = memo(() => {
  const { models = [], identifier, name } = useDetailContext();
  const { t } = useTranslation('providers');
  return (
    <Flexbox align={'center'} gap={8} horizontal width={'100%'}>
      <ProviderConfig />
      <ShareButton
        meta={{
          avatar: <ProviderIcon provider={identifier} size={64} type={'avatar'} />,
          desc: t(`${identifier}.description`),
          tags: (
            <Flexbox align={'center'} gap={4} horizontal justify={'center'} wrap={'wrap'}>
              {models
                .slice(0, 4)
                .filter(Boolean)
                .map((item) => (
                  <ModelTag key={item.id} model={item.id} style={styles.spacing} />
                ))}
              {models.length > 3 && <Tag>+{models.length - 3}</Tag>}
            </Flexbox>
          ),
          title: name,
          url: urlJoin(OFFICIAL_URL, '/community/provider', identifier as string),
        }}
      />
    </Flexbox>
  );
});

export default ActionButton;
