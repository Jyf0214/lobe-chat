import { Button, Flexbox, Tag } from '@lobehub/ui';
import { App, Card, Dropdown } from 'antd';
import { createStaticStyles, cssVar } from 'antd-style';
import { ChevronRight, Database, Ellipsis, Pencil, Play, Trash2 } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import NeuralNetworkLoading from '@/components/NeuralNetworkLoading';
import { agentEvalService } from '@/services/agentEval';

import { DATASET_PRESETS } from '../../../../config/datasetPresets';
import TestCaseEmptyState from './TestCaseEmptyState';
import TestCaseTable from './TestCaseTable';

const styles = createStaticStyles(({ css, cssVar }) => ({
  card: css`
    .ant-card-body {
      padding: 0;
    }
  `,
  datasetHeader: css`
    cursor: pointer;

    display: flex;
    gap: 12px;
    align-items: center;

    width: 100%;
    padding: 16px;
    border: none;

    text-align: start;

    background: transparent;

    transition: background 0.2s;

    &:hover {
      background: ${cssVar.colorFillQuaternary};
    }
  `,
  datasetIcon: css`
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    width: 32px;
    height: 32px;
    border-radius: 8px;

    background: ${cssVar.colorPrimaryBg};
  `,
  expandedSection: css`
    border-block-start: 1px solid ${cssVar.colorBorderSecondary};
  `,
}));

interface DatasetCardProps {
  dataset: any;
  diffFilter: 'all' | 'easy' | 'medium' | 'hard';
  filteredCases: any[];
  isExpanded: boolean;
  loading: boolean;
  onAddCase: () => void;
  onDeleteCase: (testCase: any) => void;
  onDiffFilterChange: (filter: 'all' | 'easy' | 'medium' | 'hard') => void;
  onEdit: (dataset: any) => void;
  onEditCase: (testCase: any) => void;
  onExpand: () => void;
  onImport: () => void;
  onPageChange: (page: number, pageSize: number) => void;
  onPreview: (testCase: any) => void;
  onRefresh: () => void;
  onRun: () => void;
  onSearchChange: (value: string) => void;
  pagination: { current: number; pageSize: number };
  search: string;
  total: number;
}

const DatasetCard = memo<DatasetCardProps>(
  ({
    dataset,
    isExpanded,
    loading,
    total,
    filteredCases,
    search,
    diffFilter,
    pagination,
    onExpand,
    onEdit,
    onEditCase,
    onDeleteCase,
    onRefresh,
    onSearchChange,
    onDiffFilterChange,
    onPageChange,
    onPreview,
    onAddCase,
    onImport,
    onRun,
  }) => {
    const { t } = useTranslation('eval');
    const { modal, message } = App.useApp();

    const handleDelete = useCallback(() => {
      modal.confirm({
        content: t('dataset.delete.confirm'),
        okButtonProps: { danger: true },
        okText: t('common.delete'),
        onOk: async () => {
          try {
            await agentEvalService.deleteDataset(dataset.id);
            message.success(t('dataset.delete.success'));
            onRefresh();
          } catch {
            message.error(t('dataset.delete.error'));
          }
        },
        title: t('common.delete'),
      });
    }, [dataset.id, message, modal, onRefresh, t]);

    return (
      <Card className={styles.card}>
        <div className={styles.datasetHeader} onClick={onExpand}>
          <div className={styles.datasetIcon}>
            <Database size={16} style={{ color: 'var(--ant-color-primary)' }} />
          </div>
          <Flexbox flex={1} gap={2} style={{ minWidth: 0 }}>
            <Flexbox horizontal align="center" gap={8}>
              <p
                style={{
                  color: 'var(--ant-color-text)',
                  fontSize: 14,
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                {dataset.name}
              </p>
              {dataset.metadata?.preset && DATASET_PRESETS[dataset.metadata.preset] && (
                <Tag style={{ fontSize: 10 }}>{DATASET_PRESETS[dataset.metadata.preset].name}</Tag>
              )}
            </Flexbox>
            {dataset.description && (
              <p
                style={{
                  color: 'var(--ant-color-text-tertiary)',
                  fontSize: 12,
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {dataset.description}
              </p>
            )}
          </Flexbox>
          <span
            style={{
              color: 'var(--ant-color-text-tertiary)',
              fontSize: 12,
            }}
          >
            {dataset.testCaseCount || 0} {t('benchmark.detail.stats.cases').toLowerCase()}
          </span>
          <Button
            icon={Play}
            size="small"
            style={{
              height: 28,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onRun();
            }}
          >
            {t('run.actions.run')}
          </Button>
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  icon: <Pencil size={14} />,
                  key: 'edit',
                  label: t('common.edit'),
                  onClick: () => onEdit(dataset),
                },
                { type: 'divider' },
                {
                  danger: true,
                  icon: <Trash2 size={14} />,
                  key: 'delete',
                  label: t('common.delete'),
                  onClick: handleDelete,
                },
              ],
            }}
          >
            <Button
              icon={Ellipsis}
              size="small"
              variant="text"
              style={{
                color: cssVar.colorTextTertiary,
                height: 28,
                padding: 0,
                width: 28,
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
          <ChevronRight
            size={16}
            style={{
              color: 'var(--ant-color-text-tertiary)',
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </div>

        {isExpanded && (
          <div className={styles.expandedSection}>
            {loading ? (
              <Flexbox align="center" justify="center" style={{ padding: '48px 24px' }}>
                <NeuralNetworkLoading size={48} />
              </Flexbox>
            ) : total === 0 ? (
              <TestCaseEmptyState onAddCase={onAddCase} onImport={onImport} />
            ) : (
              <TestCaseTable
                diffFilter={diffFilter}
                pagination={pagination}
                search={search}
                testCases={filteredCases}
                total={total}
                onAddCase={onAddCase}
                onDelete={onDeleteCase}
                onDiffFilterChange={onDiffFilterChange}
                onEdit={onEditCase}
                onImport={onImport}
                onPageChange={onPageChange}
                onPreview={onPreview}
                onSearchChange={onSearchChange}
              />
            )}
          </div>
        )}
      </Card>
    );
  },
);

export default DatasetCard;
