import { Flexbox } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { memo } from 'react';

import { useQueryState } from '@/hooks/useQueryParam';
import { StyleSheet } from '@/utils/styles';

import Sidebar from '../Sidebar';
import Nav, { GroupAgentNavKey } from './Nav';
import Overview from './Overview';
import SystemRole from './SystemRole';
import Versions from './Versions';

const styles = StyleSheet.create({
  style: {
    overflow: 'hidden',
  },
});

const Details = memo<{ mobile?: boolean }>(({ mobile: isMobile }) => {
  const { mobile = isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useQueryState('activeTab', {
    clearOnDefault: true,
    defaultValue: GroupAgentNavKey.Overview,
  });

  return (
    <Flexbox gap={24}>
      <Nav
        activeTab={activeTab as GroupAgentNavKey}
        mobile={mobile}
        setActiveTab={setActiveTab}
      />
      <Flexbox
        gap={48}
        horizontal={!mobile}
        style={mobile ? { flexDirection: 'column-reverse' } : undefined}
      >
        {/* Main Content */}
        <Flexbox style={styles.style} width={'100%'}>
          {/* Tab Content */}
          {activeTab === GroupAgentNavKey.Overview && <Overview />}
          {activeTab === GroupAgentNavKey.SystemRole && <SystemRole />}
          {activeTab === GroupAgentNavKey.Versions && <Versions />}
        </Flexbox>
        <Sidebar mobile={mobile} />
      </Flexbox>
    </Flexbox>
  );
});

export default Details;
