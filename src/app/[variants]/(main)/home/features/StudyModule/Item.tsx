'use client';

import { Block, Flexbox, Image, Text } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { Clock } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { RECENT_BLOCK_SIZE } from '@/app/[variants]/(main)/home/features/const';

import { type Tutorial, type TutorialId } from './const';

const TUTORIAL_TITLE_KEYS: Record<
  TutorialId,
  | 'studyModule.tutorials.agent.title'
  | 'studyModule.tutorials.agentMarket.title'
  | 'studyModule.tutorials.agentTeam.title'
  | 'studyModule.tutorials.imageGeneration.title'
  | 'studyModule.tutorials.memory.title'
  | 'studyModule.tutorials.page.title'
  | 'studyModule.tutorials.resource.title'
  | 'studyModule.tutorials.share.title'
> = {
  agent: 'studyModule.tutorials.agent.title',
  agentMarket: 'studyModule.tutorials.agentMarket.title',
  agentTeam: 'studyModule.tutorials.agentTeam.title',
  imageGeneration: 'studyModule.tutorials.imageGeneration.title',
  memory: 'studyModule.tutorials.memory.title',
  page: 'studyModule.tutorials.page.title',
  resource: 'studyModule.tutorials.resource.title',
  share: 'studyModule.tutorials.share.title',
};

interface StudyModuleItemProps {
  tutorial: Tutorial;
}

const StudyModuleItem = memo<StudyModuleItemProps>(({ tutorial }) => {
  const { t } = useTranslation('home');

  const titleKey = TUTORIAL_TITLE_KEYS[tutorial.id];
  const title = t(titleKey);

  return (
    <Block
      clickable
      flex={'none'}
      height={RECENT_BLOCK_SIZE.STUDY.HEIGHT}
      style={{
        backgroundColor: cssVar.colorFillQuaternary,
        borderRadius: cssVar.borderRadiusLG,
        overflow: 'hidden',
      }}
      variant={'filled'}
      width={RECENT_BLOCK_SIZE.STUDY.WIDTH}
    >
      <Image
        alt={title}
        height={120}
        objectFit={'cover'}
        preview={false}
        src={tutorial.cover}
        style={{
          borderRadius: `${cssVar.borderRadiusLG} ${cssVar.borderRadiusLG} 0 0`,
          width: '100%',
        }}
        width={'100%'}
      />

      <Flexbox flex={1} gap={6} justify={'space-between'} padding={12}>
        <Text ellipsis fontSize={13} style={{ lineHeight: 1.4 }} weight={500}>
          {title}
        </Text>
        <Flexbox align={'center'} gap={4} horizontal>
          <Clock size={12} style={{ color: cssVar.colorTextSecondary }} />
          <Text ellipsis fontSize={12} type={'secondary'}>
            {t('studyModule.readingTime', { minutes: tutorial.readingTime })}
          </Text>
        </Flexbox>
      </Flexbox>
    </Block>
  );
});

export default StudyModuleItem;
