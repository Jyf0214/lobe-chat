'use client';

import { Block, Button, Checkbox, Empty, Flexbox, Text } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { HeartHandshake, Undo2Icon } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';
import { StyleSheet } from '@/utils/styles';

import LobeMessage from '../components/LobeMessage';
import OnboardingFooterActions from '../components/OnboardingFooterActions';

const styles = StyleSheet.create({
  colored2: {
    color: cssVar.colorTextDescription,
  },
  fullWidth: {
    width: '100%',
  },
  spacing: {
    listStyle: 'none',
    padding: 0,
  },
  spacing1: {
    marginTop: 16,
  },
  style: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  style1: {
    height: '100%',
    minHeight: '100%',
  },
});

type DataMode = 'share' | 'privacy';

interface DataModeStepProps {
  onBack: () => void;
  onNext: () => void;
}

const DataModeStep = memo<DataModeStepProps>(({ onBack, onNext }) => {
  const { t } = useTranslation('desktop-onboarding');
  const telemetryEnabled = useUserStore(userGeneralSettingsSelectors.telemetry);
  const updateGeneralConfig = useUserStore((s) => s.updateGeneralConfig);
  const [selectedMode, setSelectedMode] = useState<DataMode>(
    telemetryEnabled ? 'share' : 'privacy',
  );

  const setMode = useCallback(
    (mode: DataMode) => {
      setSelectedMode(mode);
      const nextTelemetry = mode === 'share';
      if (telemetryEnabled !== nextTelemetry) {
        void updateGeneralConfig({ telemetry: nextTelemetry });
      }
    },
    [telemetryEnabled, updateGeneralConfig],
  );

  // Dynamic styles based on selectedMode
  const dynamicShareStyle = StyleSheet.create({
    colored: {
      borderColor: selectedMode === 'share' ? cssVar.colorSuccess : undefined,
    },
  });

  const dynamicPrivacyStyle = StyleSheet.create({
    colored1: {
      borderColor: selectedMode === 'privacy' ? cssVar.colorSuccess : undefined,
    },
  });

  const checkIcon = (
    <Checkbox
      backgroundColor={cssVar.colorSuccess}
      checked
      shape={'circle'}
      size={20}
      style={styles.style}
    />
  );

  return (
    <Flexbox gap={16} style={styles.style1}>
      <Flexbox>
        <LobeMessage sentences={[t('screen4.title'), t('screen4.title2'), t('screen4.title3')]} />
        <Text as={'p'}>{t('screen4.description')}</Text>
      </Flexbox>
      <Flexbox gap={16} style={styles.fullWidth}>
        {/* 共享数据选项 */}
        <Block
          clickable
          flex={1}
          gap={16}
          onClick={() => setMode('share')}
          padding={16}
          style={StyleSheet.compose(styles.fullWidth, dynamicShareStyle.colored)}
          variant={'outlined'}
        >
          {selectedMode === 'share' && checkIcon}
          <Empty
            description={t('screen4.share.description')}
            descriptionProps={{
              fontSize: 14,
            }}
            icon={HeartHandshake}
            padding={0}
            title={t('screen4.share.title')}
            titleProps={{
              fontSize: 18,
            }}
            type={'page'}
          />
          <Flexbox as={'ul'} gap={4} style={styles.spacing}>
            <li>
              <Text>• {t('screen4.share.items.1')}</Text>
            </li>
            <li>
              <Text>• {t('screen4.share.items.2')}</Text>
            </li>
            <li>
              <Text>• {t('screen4.share.items.3')}</Text>
            </li>
          </Flexbox>
        </Block>

        {/* 隐私模式选项 */}
        <Block
          clickable
          flex={1}
          gap={6}
          onClick={() => setMode('privacy')}
          padding={16}
          style={StyleSheet.compose(styles.fullWidth, dynamicPrivacyStyle.colored1)}
          variant={'outlined'}
        >
          {selectedMode === 'privacy' && checkIcon}
          <Text fontSize={18} strong>
            {t('screen4.privacy.title')}
          </Text>
          <Text fontSize={14} type={'secondary'}>
            {t('screen4.privacy.description')}
          </Text>
        </Block>
      </Flexbox>
      <Text color={cssVar.colorTextSecondary} fontSize={12} style={styles.spacing1}>
        {t('screen4.footerNote')}
      </Text>
      <OnboardingFooterActions
        left={
          <Button icon={Undo2Icon} onClick={onBack} style={styles.colored2} type={'text'}>
            {t('back')}
          </Button>
        }
        right={
          <Button onClick={onNext} type={'primary'}>
            {t('next')}
          </Button>
        }
      />
    </Flexbox>
  );
});

DataModeStep.displayName = 'DataModeStep';

export default DataModeStep;
