import { isDesktop } from '@lobechat/const';
import { Flexbox, Icon, Text } from '@lobehub/ui';
import { App, Button, Divider, Dropdown, Input, Space, Switch } from 'antd';
import { type MenuProps } from 'antd';
import { ClipboardCopy, FolderOpen } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { electronSystemService } from '@/services/electron/system';
import { useChatStore } from '@/store/chat';
import { workingDirectorySelectors } from '@/store/electron/selectors';
import { useElectronStore } from '@/store/electron/store';

interface WorkingDirectoryContentProps {
  agentId: string;
  effectiveWorkingDirectory?: string;
  onClose?: () => void;
}

const WorkingDirectoryContent = memo<WorkingDirectoryContentProps>(
  ({ agentId, effectiveWorkingDirectory, onClose }) => {
    const { t } = useTranslation('plugin');
    const { message } = App.useApp();

    const activeTopicId = useChatStore((s) => s.activeTopicId);

    // Get current values from Electron Store
    const agentWorkingDirectory = useElectronStore((s) =>
      workingDirectorySelectors.agentWorkingDirectory(agentId)(s),
    );
    const topicWorkingDirectory = useElectronStore((s) =>
      activeTopicId ? workingDirectorySelectors.topicWorkingDirectory(activeTopicId)(s) : undefined,
    );

    // Installed apps
    const installedApps = useElectronStore((s) => s.installedApps);
    const useFetchInstalledApps = useElectronStore((s) => s.useFetchInstalledApps);
    useFetchInstalledApps();

    const openDirectoryInApp = useElectronStore((s) => s.openDirectoryInApp);

    // Actions
    const setWorkingDirectory = useElectronStore((s) => s.setWorkingDirectory);
    const removeWorkingDirectory = useElectronStore((s) => s.removeWorkingDirectory);

    // Local state for editing
    const [agentDir, setAgentDir] = useState(agentWorkingDirectory || '');
    const [topicDir, setTopicDir] = useState(topicWorkingDirectory || '');
    const [useTopicOverride, setUseTopicOverride] = useState(!!topicWorkingDirectory);
    const [loading, setLoading] = useState(false);

    const handleSelectAgentFolder = useCallback(async () => {
      if (!isDesktop) return;
      const folder = await electronSystemService.selectFolder({
        defaultPath: agentDir || undefined,
        title: t('localSystem.workingDirectory.selectFolder'),
      });
      if (folder) setAgentDir(folder);
    }, [agentDir, t]);

    const handleSelectTopicFolder = useCallback(async () => {
      if (!isDesktop) return;
      const folder = await electronSystemService.selectFolder({
        defaultPath: topicDir || undefined,
        title: t('localSystem.workingDirectory.selectFolder'),
      });
      if (folder) setTopicDir(folder);
    }, [topicDir, t]);

    const handleSave = useCallback(async () => {
      setLoading(true);
      try {
        if (agentDir) {
          await setWorkingDirectory(`agent:${agentId}`, agentDir);
        } else {
          await removeWorkingDirectory(`agent:${agentId}`);
        }

        if (activeTopicId && useTopicOverride) {
          if (topicDir) {
            await setWorkingDirectory(`topic:${activeTopicId}`, topicDir);
          } else {
            await removeWorkingDirectory(`topic:${activeTopicId}`);
          }
        } else if (activeTopicId && !useTopicOverride && topicWorkingDirectory) {
          await removeWorkingDirectory(`topic:${activeTopicId}`);
        }

        onClose?.();
      } finally {
        setLoading(false);
      }
    }, [
      agentId,
      agentDir,
      activeTopicId,
      useTopicOverride,
      topicDir,
      topicWorkingDirectory,
      setWorkingDirectory,
      removeWorkingDirectory,
      onClose,
    ]);

    const handleCopyPath = useCallback(() => {
      if (!effectiveWorkingDirectory) return;
      navigator.clipboard.writeText(effectiveWorkingDirectory);
      message.success(t('localSystem.workingDirectory.copiedPath'));
    }, [effectiveWorkingDirectory, message, t]);

    const openInMenuItems: MenuProps['items'] = useMemo(() => {
      if (!effectiveWorkingDirectory) return [];

      const appItems: MenuProps['items'] = installedApps.map((app) => ({
        icon: app.icon ? (
          <img alt={app.name} src={app.icon} style={{ borderRadius: 4, height: 16, width: 16 }} />
        ) : undefined,
        key: app.id,
        label: app.name,
        onClick: () => openDirectoryInApp(app.id, effectiveWorkingDirectory),
      }));

      return [
        ...appItems,
        { type: 'divider' as const },
        {
          icon: <Icon icon={ClipboardCopy} size={16} />,
          key: 'copy-path',
          label: t('localSystem.workingDirectory.copyPath'),
          onClick: handleCopyPath,
        },
      ];
    }, [effectiveWorkingDirectory, installedApps, openDirectoryInApp, handleCopyPath, t]);

    return (
      <Flexbox gap={12} style={{ maxWidth: 600, minWidth: 320 }}>
        {effectiveWorkingDirectory && (
          <>
            <Flexbox horizontal align="center" gap={8} justify="space-between">
              <Text
                ellipsis={{ tooltip: effectiveWorkingDirectory }}
                style={{ flex: 1, fontFamily: 'var(--lobe-font-family-code)', fontSize: 12 }}
              >
                {effectiveWorkingDirectory}
              </Text>
              <Dropdown menu={{ items: openInMenuItems }} trigger={['click']}>
                <Button size="small">{t('localSystem.workingDirectory.open')}</Button>
              </Dropdown>
            </Flexbox>
            <Divider style={{ margin: 0 }} />
          </>
        )}

        <Flexbox gap={4}>
          <Text style={{ fontSize: 12 }} type="secondary">
            {t('localSystem.workingDirectory.agentLevel')}
          </Text>
          <Flexbox horizontal gap={8}>
            <Input
              placeholder={t('localSystem.workingDirectory.placeholder')}
              size="small"
              style={{ flex: 1, fontSize: 12 }}
              value={agentDir}
              variant={'filled'}
              onChange={(e) => setAgentDir(e.target.value)}
            />
            {isDesktop && (
              <Button size="small" type={'text'} onClick={handleSelectAgentFolder}>
                <Icon icon={FolderOpen} size={14} />
              </Button>
            )}
          </Flexbox>
        </Flexbox>

        {activeTopicId && (
          <>
            <Divider style={{ margin: 0 }} />

            <Flexbox
              horizontal
              align="center"
              gap={8}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setUseTopicOverride(!useTopicOverride);
              }}
            >
              <Switch checked={useTopicOverride} size="small" onChange={setUseTopicOverride} />
              <Text style={{ fontSize: 12 }}>
                {t('localSystem.workingDirectory.topicOverride')}
              </Text>
            </Flexbox>

            {useTopicOverride && (
              <Flexbox gap={4}>
                <Text style={{ fontSize: 12 }} type="secondary">
                  {t('localSystem.workingDirectory.topicLevel')}
                </Text>
                <Flexbox horizontal gap={8}>
                  <Input
                    placeholder={t('localSystem.workingDirectory.placeholder')}
                    size="small"
                    style={{ flex: 1, fontSize: 12 }}
                    value={topicDir}
                    variant={'filled'}
                    onChange={(e) => setTopicDir(e.target.value)}
                  />
                  {isDesktop && (
                    <Button size="small" type={'text'} onClick={handleSelectTopicFolder}>
                      <Icon icon={FolderOpen} size={14} />
                    </Button>
                  )}
                </Flexbox>
              </Flexbox>
            )}
          </>
        )}

        <Flexbox horizontal justify="flex-end">
          <Space>
            <Button size="small" onClick={onClose}>
              {t('cancel', { ns: 'common' })}
            </Button>
            <Button loading={loading} size="small" type="primary" onClick={handleSave}>
              {t('save', { ns: 'common' })}
            </Button>
          </Space>
        </Flexbox>
      </Flexbox>
    );
  },
);

WorkingDirectoryContent.displayName = 'WorkingDirectoryContent';

export default WorkingDirectoryContent;
