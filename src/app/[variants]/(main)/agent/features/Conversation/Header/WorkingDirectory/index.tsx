import { LocalSystemManifest } from '@lobechat/builtin-tool-local-system';
import { Flexbox, Icon, Popover, Tooltip } from '@lobehub/ui';
import { createStaticStyles, cx } from 'antd-style';
import { LaptopIcon, SquircleDashed } from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { workingDirectorySelectors } from '@/store/electron/selectors';
import { useElectronStore } from '@/store/electron/store';

import WorkingDirectoryContent from './WorkingDirectoryContent';

const styles = createStaticStyles(({ css, cssVar }) => {
  return {
    base: css`
      border-radius: 6px;
      color: ${cssVar.colorTextTertiary};
      background-color: ${cssVar.colorFillTertiary};

      :hover {
        color: ${cssVar.colorTextSecondary};
        background-color: ${cssVar.colorFillSecondary};
      }
    `,
    filled: css`
      font-family: ${cssVar.fontFamilyCode};
      color: ${cssVar.colorText} !important;
    `,
  };
});

const WorkingDirectory = memo(() => {
  const { t } = useTranslation('plugin');
  const [open, setOpen] = useState(false);

  const agentId = useAgentStore((s) => s.activeAgentId);
  const activeTopicId = useChatStore((s) => s.activeTopicId);

  // Check if local-system plugin is enabled for current agent
  const plugins = useAgentStore((s) =>
    agentId ? agentByIdSelectors.getAgentPluginsById(agentId)(s) : [],
  );
  const isLocalSystemEnabled = useMemo(
    () => plugins.includes(LocalSystemManifest.identifier),
    [plugins],
  );

  // Load working directories from Electron Store
  const useFetchWorkingDirectories = useElectronStore((s) => s.useFetchWorkingDirectories);
  useFetchWorkingDirectories();

  // Lazy migration: move old chatConfig.localSystem.workingDirectory to Electron Store
  const setWorkingDirectory = useElectronStore((s) => s.setWorkingDirectory);
  const updateAgentChatConfig = useAgentStore((s) => s.updateAgentChatConfigById);
  const migratedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!agentId || migratedRef.current.has(agentId)) return;
    const agentData = useAgentStore.getState().agentMap[agentId] as any;
    const oldDir = agentData?.chatConfig?.localSystem?.workingDirectory;
    if (oldDir && !useElectronStore.getState().workingDirectories[`agent:${agentId}`]) {
      migratedRef.current.add(agentId);
      setWorkingDirectory(`agent:${agentId}`, oldDir);
      updateAgentChatConfig(agentId, { localSystem: undefined } as any);
    }
  }, [agentId, setWorkingDirectory, updateAgentChatConfig]);

  // Get working directory from Electron Store: Topic (higher priority) or Agent (fallback)
  const topicWorkingDirectory = useElectronStore((s) =>
    activeTopicId ? workingDirectorySelectors.topicWorkingDirectory(activeTopicId)(s) : undefined,
  );
  const agentWorkingDirectory = useElectronStore((s) =>
    agentId ? workingDirectorySelectors.agentWorkingDirectory(agentId)(s) : undefined,
  );

  const effectiveWorkingDirectory = topicWorkingDirectory || agentWorkingDirectory;

  // Only show when local-system is enabled and agent exists
  if (!agentId || !isLocalSystemEnabled) return null;

  // Get last folder name for display
  const hasWorkingDirectory = !!effectiveWorkingDirectory;

  const displayName = effectiveWorkingDirectory
    ? effectiveWorkingDirectory.split('/').findLast(Boolean) || effectiveWorkingDirectory
    : t('localSystem.workingDirectory.notSet');

  const content = hasWorkingDirectory ? (
    <Flexbox
      horizontal
      align="center"
      className={cx(styles.base, styles.filled)}
      gap={6}
      style={{ cursor: 'pointer', height: 32, padding: '0 12px' }}
    >
      <Icon icon={LaptopIcon} size={18} />
      <span>{displayName}</span>
    </Flexbox>
  ) : (
    <Flexbox
      horizontal
      align="center"
      className={styles.base}
      gap={6}
      style={{ cursor: 'pointer', height: 32, padding: '0 12px' }}
    >
      <Icon icon={SquircleDashed} size={16} />
      <span>{t('localSystem.workingDirectory.notSet')}</span>
    </Flexbox>
  );
  return (
    <Popover
      open={open}
      placement="bottomRight"
      trigger="click"
      content={
        <WorkingDirectoryContent
          agentId={agentId}
          effectiveWorkingDirectory={effectiveWorkingDirectory}
          onClose={() => setOpen(false)}
        />
      }
      onOpenChange={setOpen}
    >
      <div>
        {open ? (
          content
        ) : (
          <Tooltip title={effectiveWorkingDirectory || t('localSystem.workingDirectory.notSet')}>
            {content}
          </Tooltip>
        )}
      </div>
    </Popover>
  );
});

WorkingDirectory.displayName = 'WorkingDirectory';

export default WorkingDirectory;
