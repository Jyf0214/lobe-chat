import { Button, Flexbox, Input } from '@lobehub/ui';
import { Dropdown, Pagination, Table } from 'antd';
import { type ColumnsType } from 'antd/es/table';
import { createStaticStyles, cssVar } from 'antd-style';
import { Ellipsis, Eye, FileUp, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const styles = createStaticStyles(({ css, cssVar }) => ({
  filterButton: css`
    cursor: pointer;

    padding-block: 4px;
    padding-inline: 10px;
    border: none;

    font-size: 11px;
    font-weight: 500;
    text-transform: capitalize;

    background: transparent;

    transition: all 0.2s;

    &[data-active='true'] {
      color: ${cssVar.colorText};
      background: ${cssVar.colorFillSecondary};
    }

    &[data-active='false'] {
      color: ${cssVar.colorTextTertiary};

      &:hover {
        color: ${cssVar.colorText};
      }
    }

    &:not(:first-child) {
      border-inline-start: 1px solid ${cssVar.colorBorderSecondary};
    }
  `,
  filterContainer: css`
    overflow: hidden;
    display: flex;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 6px;
  `,
  filtersRow: css`
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding-block: 12px;
    padding-inline: 16px;
    border-block-end: 1px solid ${cssVar.colorBorderSecondary};
  `,
  table: css`
    .ant-table {
      font-size: 14px;
    }

    .ant-table-thead > tr > th {
      font-size: 12px;
      font-weight: 500;
      color: ${cssVar.colorTextTertiary};
      background: ${cssVar.colorFillQuaternary};
    }

    .ant-table-tbody > tr {
      &:hover {
        background: ${cssVar.colorFillQuaternary};
      }
    }
  `,
}));

interface TestCaseTableProps {
  diffFilter: 'all' | 'easy' | 'medium' | 'hard';
  onAddCase: () => void;
  onDelete: (testCase: any) => void;
  onDiffFilterChange: (filter: 'all' | 'easy' | 'medium' | 'hard') => void;
  onEdit: (testCase: any) => void;
  onImport: () => void;
  onPageChange: (page: number, pageSize: number) => void;
  onPreview: (testCase: any) => void;
  onSearchChange: (value: string) => void;
  pagination: { current: number; pageSize: number };
  search: string;
  testCases: any[];
  total: number;
}

const TestCaseTable = memo<TestCaseTableProps>(
  ({
    testCases,
    total,
    search,
    diffFilter,
    pagination,
    onSearchChange,
    onDiffFilterChange,
    onPageChange,
    onPreview,
    onEdit,
    onDelete,
    onAddCase,
    onImport,
  }) => {
    const { t } = useTranslation('eval');

    const columns: ColumnsType<any> = [
      {
        dataIndex: 'id',
        key: 'index',
        render: (_: any, __: any, index: number) => (
          <span
            style={{
              color: 'var(--ant-color-text-tertiary)',
              fontFamily: 'monospace',
              fontSize: 12,
            }}
          >
            {(pagination.current - 1) * pagination.pageSize + index + 1}
          </span>
        ),
        title: '#',
        width: 48,
      },
      {
        dataIndex: ['content', 'input'],
        ellipsis: true,
        key: 'input',
        render: (text: string) => (
          <p
            style={{
              color: 'var(--ant-color-text)',
              margin: 0,
              maxWidth: 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </p>
        ),
        title: t('table.columns.input'),
      },
      {
        dataIndex: ['content', 'expected'],
        ellipsis: true,
        key: 'expected',
        render: (text: string) => (
          <span style={{ color: 'var(--ant-color-text-secondary)' }}>{text || '-'}</span>
        ),
        title: t('table.columns.expected'),
        width: 200,
      },
      {
        dataIndex: ['content', 'category'],
        key: 'category',
        render: (text: string) => (
          <span style={{ color: 'var(--ant-color-text-tertiary)', fontSize: 12 }}>
            {text || '-'}
          </span>
        ),
        title: t('table.columns.category'),
        width: 120,
      },
      {
        key: 'actions',
        render: (_: any, record: any) => (
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  icon: <Eye size={14} />,
                  key: 'preview',
                  label: t('testCase.preview.title'),
                  onClick: () => onPreview(record),
                },
                {
                  icon: <Pencil size={14} />,
                  key: 'edit',
                  label: t('common.edit'),
                  onClick: () => onEdit(record),
                },
                { type: 'divider' },
                {
                  danger: true,
                  icon: <Trash2 size={14} />,
                  key: 'delete',
                  label: t('common.delete'),
                  onClick: () => onDelete(record),
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
            />
          </Dropdown>
        ),
        width: 48,
      },
    ];

    return (
      <>
        <div className={styles.filtersRow}>
          <Flexbox horizontal align="center" gap={8}>
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                style={{
                  color: 'var(--ant-color-text-tertiary)',
                  left: 10,
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <Input
                placeholder={t('testCase.search.placeholder')}
                size="small"
                value={search}
                style={{
                  fontSize: 12,
                  paddingLeft: 32,
                  width: 192,
                }}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                }}
              />
            </div>
            <div className={styles.filterContainer}>
              {(['all', 'easy', 'medium', 'hard'] as const).map((f) => (
                <button
                  className={styles.filterButton}
                  data-active={diffFilter === f}
                  key={f}
                  onClick={() => {
                    onDiffFilterChange(f);
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </Flexbox>
          <Flexbox horizontal gap={8}>
            <Button icon={Plus} size="small" onClick={onAddCase}>
              {t('testCase.actions.add')}
            </Button>
            <Button icon={FileUp} size="small" type="primary" onClick={onImport}>
              {t('testCase.actions.import')}
            </Button>
          </Flexbox>
        </div>
        <div className={styles.table}>
          <Table
            columns={columns}
            dataSource={testCases}
            pagination={false}
            rowKey="id"
            size="small"
          />
        </div>
        {total > pagination.pageSize && (
          <Flexbox
            horizontal
            align="center"
            justify="end"
            style={{ paddingBlock: 12, paddingInline: 16 }}
          >
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              simple
              size="small"
              total={total}
              onChange={onPageChange}
            />
          </Flexbox>
        )}
      </>
    );
  },
);

export default TestCaseTable;
