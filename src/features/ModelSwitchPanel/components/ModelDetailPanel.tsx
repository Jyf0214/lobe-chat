import { getCachedTextInputUnitRate } from '@lobechat/utils';
import { ModelIcon } from '@lobehub/icons';
import { Accordion, AccordionItem, Flexbox, Icon, Tag, Text, Tooltip } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDownToDot,
  ArrowUpFromDot,
  AtomIcon,
  CircleFadingArrowUp,
  EyeIcon,
  GlobeIcon,
  ImageIcon,
  PaperclipIcon,
  ToyBrickIcon,
  VideoIcon,
} from 'lucide-react';
import type {
  AiModelForSelect,
  FixedPricingUnit,
  ModelPriceCurrency,
  Pricing,
  PricingUnit,
  PricingUnitName,
  TieredPricingUnit,
} from 'model-bank';
import type { FC, ReactNode } from 'react';
import { memo, useMemo, useState } from 'react';
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
  const cachedInputRate = getCachedTextInputUnitRate(pricing);

  return {
    cachedInput: cachedInputRate
      ? formatPriceByCurrency(cachedInputRate, pricing?.currency as ModelPriceCurrency)
      : '0',
    input: inputRate
      ? formatPriceByCurrency(inputRate, pricing?.currency as ModelPriceCurrency)
      : '0',
    output: outputRate
      ? formatPriceByCurrency(outputRate, pricing?.currency as ModelPriceCurrency)
      : '0',
  };
};

// --- Pricing detail helpers ---

type PricingGroup = 'audio' | 'image' | 'text';

const UNIT_GROUP_MAP: Record<PricingUnitName, PricingGroup> = {
  audioInput: 'audio',
  audioInput_cacheRead: 'audio',
  audioOutput: 'audio',
  imageGeneration: 'image',
  imageInput: 'image',
  imageInput_cacheRead: 'image',
  imageOutput: 'image',
  textInput: 'text',
  textInput_cacheRead: 'text',
  textInput_cacheWrite: 'text',
  textOutput: 'text',
};

const GROUP_ORDER: PricingGroup[] = ['text', 'image', 'audio'];

const UNIT_LABEL_MAP: Record<string, string> = {
  image: '/img',
  megapixel: '/MP',
  millionCharacters: '/M chars',
  millionTokens: '/M tokens',
  second: '/s',
};

const formatUnitRate = (unit: PricingUnit, currency?: ModelPriceCurrency): string => {
  const unitLabel = UNIT_LABEL_MAP[unit.unit] || '';

  if (unit.strategy === 'fixed') {
    const price = formatPriceByCurrency((unit as FixedPricingUnit).rate, currency);
    return `$${price}${unitLabel}`;
  }

  if (unit.strategy === 'tiered') {
    const tiers = (unit as TieredPricingUnit).tiers;
    if (tiers.length === 1) {
      const price = formatPriceByCurrency(tiers[0].rate, currency);
      return `$${price}${unitLabel}`;
    }
    const low = formatPriceByCurrency(tiers[0].rate, currency);
    const high = formatPriceByCurrency(tiers.at(-1)!.rate, currency);
    return `$${low} ~ $${high}${unitLabel}`;
  }

  // lookup strategy
  if (unit.strategy === 'lookup') {
    const prices = Object.values(unit.lookup.prices);
    if (prices.length === 1) {
      const price = formatPriceByCurrency(prices[0], currency);
      return `$${price}${unitLabel}`;
    }
    const sorted = [...prices].sort((a, b) => a - b);
    const low = formatPriceByCurrency(sorted[0], currency);
    const high = formatPriceByCurrency(sorted.at(-1)!, currency);
    return `$${low} ~ $${high}${unitLabel}`;
  }

  return '-';
};

interface PricingGroupData {
  group: PricingGroup;
  units: PricingUnit[];
}

const groupPricingUnits = (units: PricingUnit[]): PricingGroupData[] => {
  const map = new Map<PricingGroup, PricingUnit[]>();
  for (const unit of units) {
    const group = UNIT_GROUP_MAP[unit.name] || 'text';
    const arr = map.get(group) || [];
    arr.push(unit);
    map.set(group, arr);
  }
  return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({ group: g, units: map.get(g)! }));
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
  const pricingGroups = useMemo(
    () => (hasPricing ? groupPricingUnits(model.pricing!.units) : []),
    [hasPricing, model.pricing],
  );
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
              alwaysShowAction
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
                      <span>{t(`ModelSwitchPanel.detail.abilities.${ability.key}` as any)}</span>
                    </Flexbox>
                    <span style={{ color: 'var(--ant-color-text-tertiary)', fontSize: 11 }}>
                      {t(
                        `ModelSelect.featureTag.${ability.key === 'files' ? 'file' : ability.key}` as any,
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
                    <Flexbox horizontal align={'center'} gap={8} style={{ fontSize: 12, fontWeight: 400, opacity: 0.65 }}>
                      {getCachedTextInputUnitRate(model.pricing!) && (
                        <Tooltip title={t('ModelSwitchPanel.detail.pricing.cachedInput', { amount: formatPrice.cachedInput })}>
                          <Flexbox horizontal align={'center'} gap={2}>
                            <Icon icon={CircleFadingArrowUp} size={'small'} />
                            {formatPrice.cachedInput}
                          </Flexbox>
                        </Tooltip>
                      )}
                      <Tooltip title={t('ModelSwitchPanel.detail.pricing.input', { amount: formatPrice.input })}>
                        <Flexbox horizontal align={'center'} gap={2}>
                          <Icon icon={ArrowUpFromDot} size={'small'} />
                          {formatPrice.input}
                        </Flexbox>
                      </Tooltip>
                      <Tooltip title={t('ModelSwitchPanel.detail.pricing.output', { amount: formatPrice.output })}>
                        <Flexbox horizontal align={'center'} gap={2}>
                          <Icon icon={ArrowDownToDot} size={'small'} />
                          {formatPrice.output}
                        </Flexbox>
                      </Tooltip>
                    </Flexbox>
                  )}
                </Flexbox>
              }
            >
              <Flexbox gap={8}>
                {pricingGroups.map(({ group, units }) => (
                  <Flexbox gap={4} key={group}>
                    {pricingGroups.length > 1 && (
                      <Flexbox className={styles.row} style={{ fontWeight: 500 }}>
                        {t(`ModelSwitchPanel.detail.pricing.group.${group}` as any)}
                      </Flexbox>
                    )}
                    {units.map((unit) => (
                      <Flexbox
                        horizontal
                        align={'center'}
                        className={styles.row}
                        justify={'space-between'}
                        key={unit.name}
                      >
                        <span>
                          {t(`ModelSwitchPanel.detail.pricing.unit.${unit.name}` as any)}
                        </span>
                        <span>{formatUnitRate(unit, model.pricing?.currency as ModelPriceCurrency)}</span>
                      </Flexbox>
                    ))}
                  </Flexbox>
                ))}
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
