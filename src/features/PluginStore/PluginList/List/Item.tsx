import { Block, Flexbox, Text } from '@lobehub/ui';
import { Progress } from 'antd';
import { cssVar } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import PluginAvatar from '@/components/Plugins/PluginAvatar';
import PluginTag from '@/components/Plugins/PluginTag';
import { useToolStore } from '@/store/tool';
import { pluginStoreSelectors } from '@/store/tool/selectors';
import { PluginInstallStep } from '@/store/tool/slices/oldStore/initialState';
import { type DiscoverPluginItem } from '@/types/discover';
import { type LobeToolType } from '@/types/tool/tool';
import { StyleSheet } from '@/utils/styles';

import Actions from './Action';

const styles = StyleSheet.create({
  spacing: {
    marginTop: 4,
  },
  style: {
    position: 'relative',
  },
  style1: {
    overflow: 'hidden',
    position: 'relative',
  },
});

interface PluginItemProps extends DiscoverPluginItem {
  active?: boolean;
  onClick?: () => void;
  type?: LobeToolType;
}
const Item = memo<PluginItemProps>(
  ({ title, description, avatar, onClick, active, identifier, author }) => {
    const { t } = useTranslation('plugin');
    const installProgress = useToolStore(
      pluginStoreSelectors.getPluginInstallProgress(identifier),
      isEqual,
    );

    const stepText = installProgress ? t(`mcpInstall.${installProgress.step}` as any) : undefined;
    const hasError = installProgress?.step === PluginInstallStep.ERROR;

    return (
      <Flexbox gap={0}>
        <Block
          align={'center'}
          clickable
          gap={8}
          horizontal
          justify={'space-between'}
          onClick={onClick}
          paddingBlock={8}
          paddingInline={12}
          style={styles.style}
          variant={active ? 'filled' : 'borderless'}
        >
          <Flexbox align={'center'} flex={1} gap={8} horizontal style={styles.style1}>
            <PluginAvatar avatar={avatar} />
            <Flexbox flex={1} gap={4} style={styles.style1}>
              <Flexbox align={'center'} gap={4} horizontal>
                <Text ellipsis strong>
                  {title}
                </Text>
                <PluginTag author={author} type={'plugin'} />
              </Flexbox>
              <Text ellipsis fontSize={12} type={'secondary'}>
                {description}
              </Text>
            </Flexbox>
          </Flexbox>
          <Actions identifier={identifier} />
        </Block>

        {installProgress && !hasError && (
          <Flexbox paddingBlock={4} paddingInline={12}>
            <Progress
              percent={installProgress.progress}
              showInfo={false}
              size="small"
              status="active"
              strokeColor={{ '0%': cssVar.blue, '100%': cssVar.geekblue }}
            />
            {stepText && (
              <Text fontSize={11} style={styles.spacing} type={'secondary'}>
                ({installProgress.progress}%) {stepText}
              </Text>
            )}
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

export default Item;
