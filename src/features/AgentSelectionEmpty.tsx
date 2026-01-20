import { Center, Empty, type EmptyProps } from '@lobehub/ui';
import { Users } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  style: {
    minHeight: '30vh',
  },
  style1: {
    maxWidth: 400,
  },
});

interface AgentSelectionEmptyProps extends Omit<EmptyProps, 'icon'> {
  search?: boolean;
  variant?: 'noAvailable' | 'noSelected' | 'empty';
}

const AgentSelectionEmpty = memo<AgentSelectionEmptyProps>(
  ({ search, variant = 'empty', ...rest }) => {
    const { t } = useTranslation('home');

    let description = t('agentSelection.empty');
    if (search) {
      description = t('agentSelection.search');
    } else if (variant === 'noAvailable') {
      description = t('agentSelection.noAvailable');
    } else if (variant === 'noSelected') {
      description = t('agentSelection.noSelected');
    }

    return (
      <Center height="100%" style={styles.style} width="100%">
        <Empty
          description={description}
          descriptionProps={{
            fontSize: 14,
          }}
          icon={Users}
          style={styles.style1}
          {...rest}
        />
      </Center>
    );
  },
);

AgentSelectionEmpty.displayName = 'AgentSelectionEmpty';

export default AgentSelectionEmpty;
