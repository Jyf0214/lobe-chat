import { ModelIcon } from '@lobehub/icons';
import { Flexbox, Icon, Tag, Text } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import type { LucideIcon } from 'lucide-react';
import {
  AtomIcon,
  ChevronRightIcon,
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
  container: css`
    padding: 8px;
  `,
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
  sectionCollapsibleTitle: css`
    cursor: pointer;
    user-select: none;

    padding-block: 6px;
    padding-inline: 8px;
    border-inline-start: 3px solid var(--section-color, ${cssVar.colorPrimary});
    border-radius: 0 6px 6px 0;

    font-size: 13px;
    font-weight: 500;

    background: ${cssVar.colorFillQuaternary};

    &:hover {
      background: ${cssVar.colorFillTertiary};
    }
  `,
  sectionTitle: css`
    padding-block: 6px;
    padding-inline: 8px;
    border-inline-start: 3px solid var(--section-color, ${cssVar.colorPrimary});
    border-radius: 0 6px 6px 0;

    font-size: 13px;
    font-weight: 500;

    background: ${cssVar.colorFillQuaternary};
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

interface SectionProps {
  children: ReactNode;
  color?: string;
  title: string;
}

const Section: FC<SectionProps> = ({ children, color, title }) => (
  <Flexbox gap={6}>
    <span className={styles.sectionTitle} style={{ '--section-color': color } as any}>
      {title}
    </span>
    {children}
  </Flexbox>
);

const PricingSection: FC<{ color?: string; formatPrice: { input: string; output: string }; t: any }> = memo(
  ({ color, formatPrice, t }) => {
    const [open, setOpen] = useState(false);

    return (
      <Flexbox gap={6}>
        <Flexbox
          horizontal
          align={'center'}
          className={styles.sectionCollapsibleTitle}
          justify={'space-between'}
          onClick={() => setOpen(!open)}
          style={{ '--section-color': color } as any}
        >
          <Flexbox horizontal align={'center'} gap={4}>
            <Icon
              icon={ChevronRightIcon}
              size={'small'}
              style={{
                transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 200ms ease',
              }}
            />
            <span>{t('ModelSwitchPanel.detail.pricing')}</span>
          </Flexbox>
          {!open && (
            <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.6 }}>
              ${formatPrice.input} / ${formatPrice.output}
            </span>
          )}
        </Flexbox>
        {open && (
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
        )}
      </Flexbox>
    );
  },
);

interface AbilityItem {
  color: string;
  icon: LucideIcon;
  key: string;
}

const AbilitiesSection: FC<{ color?: string; enabledAbilities: AbilityItem[]; t: any }> = memo(
  ({ color, enabledAbilities, t }) => {
    const [open, setOpen] = useState(false);

    return (
      <Flexbox gap={6}>
        <Flexbox
          horizontal
          align={'center'}
          className={styles.sectionCollapsibleTitle}
          justify={'space-between'}
          onClick={() => setOpen(!open)}
          style={{ '--section-color': color } as any}
        >
          <Flexbox horizontal align={'center'} gap={4}>
            <Icon
              icon={ChevronRightIcon}
              size={'small'}
              style={{
                transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 200ms ease',
              }}
            />
            <span>{t('ModelSwitchPanel.detail.abilities')}</span>
          </Flexbox>
          {!open && (
            <Flexbox horizontal gap={4}>
              {enabledAbilities.map((ability) => (
                <Tag color={ability.color} key={ability.key}>
                  <Icon icon={ability.icon} style={{ fontSize: 12 }} />
                </Tag>
              ))}
            </Flexbox>
          )}
        </Flexbox>
        {open && (
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
                  {t(`ModelSelect.featureTag.${ability.key === 'files' ? 'file' : ability.key}`)}
                </span>
              </Flexbox>
            ))}
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

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
      <Flexbox gap={8}>
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
        <Flexbox gap={12}>
          {/* Context Length */}
          {hasContext && (
            <Flexbox
              horizontal
              align={'center'}
              className={styles.sectionTitle}
              justify={'space-between'}
              style={{ '--section-color': '#1677ff' } as any}
            >
              <span>
                {t('ModelSwitchPanel.detail.context')}
              </span>
              <span style={{ fontSize: 12 }}>
                {model.contextWindowTokens === 0
                  ? '∞'
                  : `${formatTokenNumber(model.contextWindowTokens!)} tokens`}
              </span>
            </Flexbox>
          )}

          {/* Abilities */}
          {hasAbilities && (
            <AbilitiesSection color="#722ed1" enabledAbilities={enabledAbilities} t={t} />
          )}

          {/* Pricing Section */}
          {hasPricing && formatPrice && (
            <PricingSection color="#fa8c16" formatPrice={formatPrice} t={t} />
          )}

          {/* Model Config */}
          {extraControls && (
            <Section color="#52c41a" title={t('ModelSwitchPanel.detail.config')}>
              {extraControls}
            </Section>
          )}
        </Flexbox>
      )}
    </Flexbox>
  );
});

ModelDetailPanel.displayName = 'ModelDetailPanel';

export default ModelDetailPanel;
