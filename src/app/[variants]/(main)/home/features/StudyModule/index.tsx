'use client';

import { ActionIcon, DropdownMenu } from '@lobehub/ui';
import { BookOpen, MoreHorizontal } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import GroupBlock from '../components/GroupBlock';
import ScrollShadowWithButton from '../components/ScrollShadowWithButton';
import StudyModuleList from './List';

const StudyModule = memo(() => {
  const { t } = useTranslation('home');

  return (
    <GroupBlock
      action={
        <DropdownMenu
          items={[
            {
              key: 'learn-more',
              label: t('studyModule.learnMore'),
              onClick: () => {
                window.open('https://lobehub.com/docs/usage', '_blank');
              },
            },
          ]}
        >
          <ActionIcon icon={MoreHorizontal} size="small" />
        </DropdownMenu>
      }
      icon={BookOpen}
      title={t('studyModule.title')}
    >
      <ScrollShadowWithButton>
        <StudyModuleList />
      </ScrollShadowWithButton>
    </GroupBlock>
  );
});

export default StudyModule;
