import { type ModelPerformance, type ModelUsage } from '@lobechat/types';
import { Center, Flexbox, Icon, Popover } from '@lobehub/ui';
import { Divider } from 'antd';
import { cssVar } from 'antd-style';
import { BadgeCent, CoinsIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import InfoTooltip from '@/components/InfoTooltip';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { formatNumber, formatShortenNumber } from '@/utils/format';
import { StyleSheet } from '@/utils/styles';

import AnimatedNumber from './AnimatedNumber';
import ModelCard from './ModelCard';
import TokenProgress, { type TokenProgressItem } from './TokenProgress';
import { getDetailsToken } from './tokens';

const styles = StyleSheet.create({
  colored: {
    color: cssVar.colorTextDescription,
    fontSize: 12,
  },
  colored1: {
    color: cssVar.colorTextSecondary,
  },
  spacing: {
    marginBlock: 8,
  },
  style: {
    minWidth: 200,
  },
  style1: {
    fontWeight: 500,
  },
  style2: {
    cursor: 'pointer',
  },
});

interface TokenDetailProps {
  model: string;
  performance?: ModelPerformance;
  provider: string;
  usage: ModelUsage;
}

const TokenDetail = memo<TokenDetailProps>(({ usage, performance, model, provider }) => {
  const { t } = useTranslation('chat');

  // 使用 systemStatus 管理短格式显示状态
  const isShortFormat = useGlobalStore(systemStatusSelectors.tokenDisplayFormatShort);
  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);

  const modelCard = useAiInfraStore(aiModelSelectors.getModelCard(model, provider));
  const isShowCredit = useGlobalStore(systemStatusSelectors.isShowCredit) && !!modelCard?.pricing;

  const detailTokens = getDetailsToken(usage, modelCard);
  const inputDetails = [
    !!detailTokens.inputAudio && {
      color: cssVar.cyan9,
      id: 'reasoning',
      title: t('messages.tokenDetails.inputAudio'),
      value: isShowCredit ? detailTokens.inputAudio.credit : detailTokens.inputAudio.token,
    },
    !!detailTokens.inputCitation && {
      color: cssVar.orange,
      id: 'inputText',
      title: t('messages.tokenDetails.inputCitation'),
      value: isShowCredit ? detailTokens.inputCitation.credit : detailTokens.inputCitation.token,
    },
    !!detailTokens.inputText && {
      color: cssVar.green,
      id: 'inputText',
      title: t('messages.tokenDetails.inputText'),
      value: isShowCredit ? detailTokens.inputText.credit : detailTokens.inputText.token,
    },
  ].filter(Boolean) as TokenProgressItem[];

  const outputDetails = [
    !!detailTokens.outputReasoning && {
      color: cssVar.pink,
      id: 'reasoning',
      title: t('messages.tokenDetails.reasoning'),
      value: isShowCredit
        ? detailTokens.outputReasoning.credit
        : detailTokens.outputReasoning.token,
    },
    !!detailTokens.outputImage && {
      color: cssVar.purple,
      id: 'outputImage',
      title: t('messages.tokenDetails.outputImage'),
      value: isShowCredit ? detailTokens.outputImage.credit : detailTokens.outputImage.token,
    },
    !!detailTokens.outputAudio && {
      color: cssVar.cyan9,
      id: 'outputAudio',
      title: t('messages.tokenDetails.outputAudio'),
      value: isShowCredit ? detailTokens.outputAudio.credit : detailTokens.outputAudio.token,
    },
    !!detailTokens.outputText && {
      color: cssVar.green,
      id: 'outputText',
      title: t('messages.tokenDetails.outputText'),
      value: isShowCredit ? detailTokens.outputText.credit : detailTokens.outputText.token,
    },
  ].filter(Boolean) as TokenProgressItem[];

  const totalDetail = [
    !!detailTokens.inputCacheMiss && {
      color: cssVar.colorFill,

      id: 'uncachedInput',
      title: t('messages.tokenDetails.inputUncached'),
      value: isShowCredit ? detailTokens.inputCacheMiss.credit : detailTokens.inputCacheMiss.token,
    },
    !!detailTokens.inputCached && {
      color: cssVar.orange,
      id: 'inputCached',
      title: t('messages.tokenDetails.inputCached'),
      value: isShowCredit ? detailTokens.inputCached.credit : detailTokens.inputCached.token,
    },
    !!detailTokens.inputCachedWrite && {
      color: cssVar.yellow,
      id: 'cachedWriteInput',
      title: t('messages.tokenDetails.inputWriteCached'),
      value: isShowCredit
        ? detailTokens.inputCachedWrite.credit
        : detailTokens.inputCachedWrite.token,
    },
    !!detailTokens.totalOutput && {
      color: cssVar.colorSuccess,
      id: 'output',
      title: t('messages.tokenDetails.output'),
      value: isShowCredit ? detailTokens.totalOutput.credit : detailTokens.totalOutput.token,
    },
  ].filter(Boolean) as TokenProgressItem[];

  const totalCount =
    isShowCredit && !!detailTokens.totalTokens
      ? detailTokens.totalTokens.credit
      : detailTokens.totalTokens!.token;

  const detailTotal = formatNumber(totalCount);

  const averagePricing = formatNumber(
    detailTokens.totalTokens!.credit / detailTokens.totalTokens!.token,
    2,
  );

  const tps = performance?.tps ? formatNumber(performance.tps, 2) : undefined;
  const ttft = performance?.ttft ? formatNumber(performance.ttft / 1000, 2) : undefined;

  return (
    <Popover
      content={
        <Flexbox gap={8} style={styles.style}>
          {modelCard && <ModelCard {...modelCard} provider={provider} />}

          <Flexbox gap={20}>
            {inputDetails.length > 1 && (
              <Flexbox gap={4}>
                <Flexbox
                  align={'center'}
                  gap={4}
                  horizontal
                  justify={'space-between'}
                  width={'100%'}
                >
                  <div style={styles.colored}>{t('messages.tokenDetails.inputTitle')}</div>
                </Flexbox>
                <TokenProgress data={inputDetails} showIcon />
              </Flexbox>
            )}
            {outputDetails.length > 1 && (
              <Flexbox gap={4}>
                <Flexbox
                  align={'center'}
                  gap={4}
                  horizontal
                  justify={'space-between'}
                  width={'100%'}
                >
                  <div style={styles.colored}>{t('messages.tokenDetails.outputTitle')}</div>
                </Flexbox>
                <TokenProgress data={outputDetails} showIcon />
              </Flexbox>
            )}
            <Flexbox>
              <TokenProgress data={totalDetail} showIcon />
              <Divider style={styles.spacing} />
              <Flexbox align={'center'} gap={4} horizontal justify={'space-between'}>
                <div style={styles.colored1}>{t('messages.tokenDetails.total')}</div>
                <div style={styles.style1}>{detailTotal}</div>
              </Flexbox>
              {isShowCredit && (
                <Flexbox align={'center'} gap={4} horizontal justify={'space-between'}>
                  <div style={styles.colored1}>{t('messages.tokenDetails.average')}</div>
                  <div style={styles.style1}>{averagePricing}</div>
                </Flexbox>
              )}
              {tps && (
                <Flexbox align={'center'} gap={4} horizontal justify={'space-between'}>
                  <Flexbox gap={8} horizontal>
                    <div style={styles.colored1}>{t('messages.tokenDetails.speed.tps.title')}</div>
                    <InfoTooltip title={t('messages.tokenDetails.speed.tps.tooltip')} />
                  </Flexbox>
                  <div style={styles.style1}>{tps}</div>
                </Flexbox>
              )}
              {ttft && (
                <Flexbox align={'center'} gap={4} horizontal justify={'space-between'}>
                  <Flexbox gap={8} horizontal>
                    <div style={styles.colored1}>{t('messages.tokenDetails.speed.ttft.title')}</div>
                    <InfoTooltip title={t('messages.tokenDetails.speed.ttft.tooltip')} />
                  </Flexbox>
                  <div style={styles.style1}>{ttft}s</div>
                </Flexbox>
              )}
            </Flexbox>
          </Flexbox>
        </Flexbox>
      }
      placement={'top'}
      trigger="hover"
    >
      <Center
        gap={2}
        horizontal
        onClick={(e) => {
          // 阻止 Popover 并切换格式
          e.preventDefault();
          e.stopPropagation();
          updateSystemStatus({ tokenDisplayFormatShort: !isShortFormat });
        }}
        style={styles.style2}
      >
        <Icon icon={isShowCredit ? BadgeCent : CoinsIcon} />
        <AnimatedNumber
          duration={1500}
          formatter={(value) => {
            const roundedValue = Math.round(value);
            if (isShortFormat) {
              return (formatShortenNumber(roundedValue) as string).toLowerCase?.();
            }
            return new Intl.NumberFormat('en-US').format(roundedValue);
          }}
          // Force remount when switching between token/credit to prevent unwanted animation
          // See: https://github.com/lobehub/lobe-chat/pull/10098
          key={isShowCredit ? 'credit' : 'token'}
          value={totalCount}
        />
      </Center>
    </Popover>
  );
});

export default TokenDetail;
