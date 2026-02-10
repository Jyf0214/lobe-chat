import { Flexbox } from '@lobehub/ui';
import { BotMessageSquareIcon } from 'lucide-react';
import { memo } from 'react';

import NavHeader from '@/features/NavHeader';
import ToggleRightPanelButton from '@/features/RightPanel/ToggleRightPanelButton';

import AgentForkTag from './AgentForkTag';
import AgentStatusTag from './AgentStatusTag';
import AutoSaveHint from './AutoSaveHint';

const Header = memo(() => {
  return (
    <NavHeader
      right={<ToggleRightPanelButton icon={BotMessageSquareIcon} showActive={true} />}
      left={
        <Flexbox horizontal gap={8}>
          <AutoSaveHint />
          <AgentStatusTag />
          <AgentForkTag />
        </Flexbox>
      }
    />
  );
});

export default Header;
