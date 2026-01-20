import { Plans } from '@lobechat/types';
import { Tag } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import urlJoin from 'url-join';

import { OFFICIAL_URL } from '@/const/url';
import { isDesktop } from '@/const/version';
import PlanIcon from '@/features/PlanIcon';
import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  colored: {
    background: cssVar.colorFill,
    borderRadius: 12,
    cursor: 'pointer',
  },
  style: {
    cursor: 'pointer',
  },
});

export enum PlanType {
  Preview = 'preview',
}

export interface PlanTagProps {
  type?: PlanType | Plans;
}

const PlanTag = memo<PlanTagProps>(({ type = PlanType.Preview }) => {
  const { t } = useTranslation('common');

  if (type === PlanType.Preview) {
    return (
      <Tag style={styles.colored} variant={'filled'}>
        {t('userPanel.community')}
      </Tag>
    );
  }

  const isFree = type === Plans.Free;

  return (
    <Link
      style={styles.style}
      target={isDesktop ? '_blank' : undefined}
      to={urlJoin(isDesktop ? OFFICIAL_URL : '/', isFree ? '/settings/plans' : '/settings/usage')}
    >
      <PlanIcon plan={type} size={22} type={'tag'} />
    </Link>
  );
});

export default PlanTag;
