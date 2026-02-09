import { ModelIcon } from '@lobehub/icons';
import { Accordion, AccordionItem, Flexbox, Icon, Tag, Text } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import type { LucideIcon } from 'lucide-react';
import {
  AtomIcon,
  EyeIcon,
  GlobeIcon,
  ImageIcon,
  PaperclipIcon,
  ToyBrickIcon,
  VideoIcon,
} from 'lucide-react';
import type { AiModelForSelect, ModelPriceCurrency, Pricing } from 'model-bank';
import type { FC, ReactNode } from 'react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { formatTokenNumber } from '@/utils/format';
import { formatPriceByCurrency, getTextInputUnitRate, getTextOutputUnitRate } from '@/utils/index';

const styles = createStaticStyles(({ css, cssVar }) => ({
  container: css``,
  description: css`
    font-size: 12px;
    line-height: 1.5;
    color: ${cssVar.colorTextSecondary};
  `,
  row: css`
    padding-block: 4px;
    padding-inline: 8px;
    font-size: 12px;
    color: ${cssVar.colorTextSecondary};
  `,
}));

const getPrice = (pricing: Pricing) => {
  const inputRate = getTextInputUnitRate(pricing);
  const outputRate = getTextOutputUnitRate(pricing);

  return {
    input: inputRate
      ? formatPriceByCurrency(inputRate, pricing?.currency as ModelPriceCurrency)
      : '0',
    output: outputRate
      ? formatPriceByCurrency(outputRate, pricing?.currency as ModelPriceCurrency)
      : '0',
  };
};

interface AbilityItem {
  color: string;
  icon: LucideIcon;
  key: string;
}

const ABILITY_CONFIG: AbilityItem[] = [
  { color: 'success', icon: EyeIcon, key: 'vision' },
  { color: 'success', icon: PaperclipIcon, key: 'files' },
  { color: 'success', icon: ImageIcon, key: 'imageOutput' },
  { color: 'magenta', icon: VideoIcon, key: 'video' },
  { color: 'info', icon: ToyBrickIcon, key: 'functionCall' },
  { color: 'purple', icon: AtomIcon, key: 'reasoning' },
  { color: 'cyan', icon: GlobeIcon, key: 'search' },
];

interface ModelDetailPanelProps {
  extraControls?: ReactNode;
  model: AiModelForSelect;
}

const ModelDetailPanel: FC<ModelDetailPanelProps> = memo(({ extraControls, model }) => {
  const { t } = useTranslation('components');
  const { t: tModels } = useTranslation('models');
  const [expandedKeys, setExpandedKeys] = useState<string[]>(() => {
    const keys: string[] = [];
    if (extraControls) keys.push('config');
    return keys;
  });

  const hasPricing = !!model.pricing;
  const formatPrice = hasPricing ? getPrice(model.pricing!) : null;
  const hasContext = typeof model.contextWindowTokens === 'number';
  const enabledAbilities = ABILITY_CONFIG.filter(
    (a) => model.abilities[a.key as keyof typeof model.abilities],
  );
  const hasAbilities = enabledAbilities.length > 0;

  return (
    <Flexbox className={styles.container} gap={16}>
      {/* Header */}
      <Flexbox gap={8} padding={8}>
        <Flexbox horizontal align={'center'} gap={8}>
          <ModelIcon model={model.id} size={28} />
          <Text ellipsis style={{ fontSize: 16, fontWeight: 600 }}>
            {model.displayName || model.id}
          </Text>
        </Flexbox>
        {model.description && (
          <div className={styles.description}>{tModels(`${model.id}.description`)}</div>
        )}
      </Flexbox>

      {/* Sections */}
      {(hasPricing || hasContext || hasAbilities || extraControls) && (
        <Accordion
          expandedKeys={expandedKeys}
          gap={8}
          indicatorPlacement={'end'}
          onExpandedChange={(keys) => setExpandedKeys(keys as string[])}
        >
          {/* Context Length */}
          {hasContext && (
            <AccordionItem
              hideIndicator
              allowExpand={false}
              itemKey="context"
              paddingBlock={6}
              paddingInline={8}
              title={
                <Flexbox
                  horizontal
                  align={'center'}
                  justify={'space-between'}
                  style={{ flex: 1 }}
                >
                  <Flexbox horizontal align={'center'} gap={8}>
                    <div style={{ background: '#1677ff', borderRadius: 2, flexShrink: 0, height: 14, width: 3 }} />
                    <span>{t('ModelSwitchPanel.detail.context')}</span>
                  </Flexbox>
                  <span style={{ fontSize: 12, fontWeight: 400 }}>
                    {model.contextWindowTokens === 0
                      ? '∞'
                      : `${formatTokenNumber(model.contextWindowTokens!)} tokens`}
                  </span>
                </Flexbox>
              }
            />
          )}

          {/* Abilities */}
          {hasAbilities && (
            <AccordionItem
              itemKey="abilities"
              paddingBlock={6}
              paddingInline={8}
              title={
                <Flexbox
                  horizontal
                  align={'center'}
                  justify={'space-between'}
                  style={{ flex: 1 }}
                >
                  <Flexbox horizontal align={'center'} gap={8}>
                    <div style={{ background: '#722ed1', borderRadius: 2, flexShrink: 0, height: 14, width: 3 }} />
                    <span>{t('ModelSwitchPanel.detail.abilities')}</span>
                  </Flexbox>
                  {!expandedKeys.includes('abilities') && (
                    <Flexbox horizontal gap={4}>
                      {enabledAbilities.map((ability) => (
                        <Tag color={ability.color} key={ability.key}>
                          <Icon icon={ability.icon} style={{ fontSize: 12 }} />
                        </Tag>
                      ))}
                    </Flexbox>
                  )}
                </Flexbox>
              }
            >
              <Flexbox gap={4}>
                {enabledAbilities.map((ability) => (
                  <Flexbox
                    horizontal
                    align={'center'}
                    className={styles.row}
                    justify={'space-between'}
                    key={ability.key}
                  >
                    <Flexbox horizontal align={'center'} gap={6}>
                      <Icon icon={ability.icon} style={{ fontSize: 12 }} />
                      <span>{t(`ModelSwitchPanel.detail.abilities.${ability.key}`)}</span>
                    </Flexbox>
                    <span style={{ color: 'var(--ant-color-text-tertiary)', fontSize: 11 }}>
                      {t(
                        `ModelSelect.featureTag.${ability.key === 'files' ? 'file' : ability.key}`,
                      )}
                    </span>
                  </Flexbox>
                ))}
              </Flexbox>
            </AccordionItem>
          )}

          {/* Pricing */}
          {hasPricing && formatPrice && (
            <AccordionItem
              itemKey="pricing"
              paddingBlock={6}
              paddingInline={8}
              title={
                <Flexbox
                  horizontal
                  align={'center'}
                  justify={'space-between'}
                  style={{ flex: 1 }}
                >
                  <Flexbox horizontal align={'center'} gap={8}>
                    <div style={{ background: '#fa8c16', borderRadius: 2, flexShrink: 0, height: 14, width: 3 }} />
                    <span>{t('ModelSwitchPanel.detail.pricing')}</span>
                  </Flexbox>
                  {!expandedKeys.includes('pricing') && (
                    <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.6 }}>
                      ${formatPrice.input} / ${formatPrice.output}
                    </span>
                  )}
                </Flexbox>
              }
            >
              <Flexbox gap={4}>
                <Flexbox horizontal className={styles.row} justify={'space-between'}>
                  <span>{t('ModelSwitchPanel.detail.pricing.input')}</span>
                  <span>${formatPrice.input}/M tokens</span>
                </Flexbox>
                <Flexbox horizontal className={styles.row} justify={'space-between'}>
                  <span>{t('ModelSwitchPanel.detail.pricing.output')}</span>
                  <span>${formatPrice.output}/M tokens</span>
                </Flexbox>
              </Flexbox>
            </AccordionItem>
          )}

          {/* Model Config */}
          {extraControls && (
            <AccordionItem
              itemKey="config"
              paddingBlock={6}
              paddingInline={8}
              title={
                <Flexbox horizontal align={'center'} gap={8}>
                  <div style={{ background: '#52c41a', borderRadius: 2, flexShrink: 0, height: 14, width: 3 }} />
                  <span>{t('ModelSwitchPanel.detail.config')}</span>
                </Flexbox>
              }
            >
              {extraControls}
            </AccordionItem>
          )}
        </Accordion>
      )}
    </Flexbox>
  );
});

ModelDetailPanel.displayName = 'ModelDetailPanel';

export default ModelDetailPanel;
