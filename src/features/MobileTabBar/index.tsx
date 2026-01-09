import { Icon } from '@lobehub/ui';
import { TabBar, type TabBarProps } from '@lobehub/ui/mobile';
import { createStaticStyles, cssVar } from 'antd-style';
import { Bot, MessageSquare, User } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { SidebarTabKey } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

const styles = createStaticStyles(({ css }) => ({
  active: css`
    svg {
      fill: color-mix(in srgb, ${cssVar.colorPrimary} 25%, transparent);
    }
  `,
}));

interface Props {
  className?: string;
  tabBarKey?: SidebarTabKey;
}

export default memo<Props>(({ className, tabBarKey }) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const openSettings = () => {
    navigate('/settings/provider/all');
  };
  const { showMarket } = useServerConfigStore(featureFlagsSelectors);

  const items: TabBarProps['items'] = useMemo(
    () =>
      [
        {
          icon: (active: boolean) => (
            <Icon className={active ? styles.active : undefined} icon={MessageSquare} />
          ),
          key: SidebarTabKey.Chat,
          onClick: () => {
            navigate('/agent');
          },
          title: t('tab.chat'),
        },
        showMarket && {
          icon: (active: boolean) => (
            <Icon className={active ? styles.active : undefined} icon={Bot} />
          ),
          key: SidebarTabKey.Community,
          onClick: () => {
            navigate('/community');
          },
          title: t('tab.community'),
        },
        {
          icon: (active: boolean) => (
            <Icon className={active ? styles.active : undefined} icon={User} />
          ),
          key: SidebarTabKey.Setting,
          onClick: openSettings,
          title: t('tab.setting'),
        },
      ].filter(Boolean) as TabBarProps['items'],
    [t],
  );

  return <TabBar activeKey={tabBarKey} className={className} items={items} safeArea />;
});
