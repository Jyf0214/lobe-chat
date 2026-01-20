'use client';

import { ActionIcon, Block, Text } from '@lobehub/ui';
import { ChevronsUpDownIcon } from 'lucide-react';
import React, { type PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';

import SupervisorAvatar from '@/app/[variants]/(main)/group/features/GroupAvatar';
import { SkeletonItem } from '@/features/NavPanel/components/SkeletonList';
import { useAgentGroupStore } from '@/store/agentGroup';
import { agentGroupSelectors } from '@/store/agentGroup/selectors';
import { StyleSheet } from '@/utils/styles';

import SwitchPanel from './SwitchPanel';

const styles = StyleSheet.create({
  style: {
    minWidth: 32,
    overflow: 'hidden',
  },
  style1: {
    width: 24,
  },
});

const Agent = memo<PropsWithChildren>(() => {
  const { t } = useTranslation(['chat', 'common']);

  const [isGroupsInit, groupMeta] = useAgentGroupStore((s) => [
    agentGroupSelectors.isGroupsInit(s),
    agentGroupSelectors.currentGroupMeta(s),
  ]);

  const displayTitle = groupMeta?.title || t('untitledGroup', { ns: 'chat' });

  if (isGroupsInit) return <SkeletonItem height={32} padding={0} />;

  return (
    <SwitchPanel>
      <Block
        align={'center'}
        clickable
        gap={8}
        horizontal
        padding={2}
        style={styles.style}
        variant={'borderless'}
      >
        <SupervisorAvatar size={28} />
        <Text ellipsis weight={500}>
          {displayTitle}
        </Text>
        <ActionIcon
          icon={ChevronsUpDownIcon}
          size={{
            blockSize: 28,
            size: 16,
          }}
          style={styles.style1}
        />
      </Block>
    </SwitchPanel>
  );
});

export default Agent;
