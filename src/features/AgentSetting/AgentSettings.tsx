import { Skeleton } from '@lobehub/ui';
import { Suspense, memo } from 'react';

import { ChatSettingsTabs } from '@/store/global/initialState';
import { useServerConfigStore } from '@/store/serverConfig';
import { StyleSheet } from '@/utils/styles';

import AgentSettingsContent from './AgentSettingsContent';
import { AgentSettingsProvider } from './AgentSettingsProvider';
import { type StoreUpdaterProps } from './StoreUpdater';

const styles = StyleSheet.create({
  spacing: {},
});

export interface AgentSettingsProps extends StoreUpdaterProps {
  tab: ChatSettingsTabs;
}

const AgentSettings = memo<AgentSettingsProps>(({ tab = ChatSettingsTabs.Meta, ...rest }) => {
  const isMobile = useServerConfigStore((s) => s.isMobile);
  const spacingStyle = {
    ...styles.spacing,
    padding: isMobile ? 16 : 0,
  };
  const loadingSkeleton = (
    <Skeleton active paragraph={{ rows: 6 }} style={spacingStyle} title={false} />
  );

  return (
    <AgentSettingsProvider {...rest}>
      <Suspense fallback={loadingSkeleton}>
        <AgentSettingsContent loadingSkeleton={loadingSkeleton} tab={tab} />
      </Suspense>
    </AgentSettingsProvider>
  );
});

export default AgentSettings;
