import { Flexbox, Icon } from '@lobehub/ui';
import { Card, Progress } from 'antd';
import { createStaticStyles } from 'antd-style';
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, DollarSign, XCircle } from 'lucide-react';
import { memo } from 'react';
import { Link } from 'react-router-dom';

import StatusBadge from '../../../../features/StatusBadge';

const styles = createStaticStyles(({ css, cssVar }) => ({
  card: css`
    .ant-card-body {
      padding: 20px;
    }

    transition: all 0.2s;

    &:hover {
      border-color: ${cssVar.colorPrimaryBorder};
      background: ${cssVar.colorFillQuaternary};
    }
  `,
  meta: css`
    font-size: 12px;
    color: ${cssVar.colorTextTertiary};
  `,
  name: css`
    overflow: hidden;

    font-size: 14px;
    font-weight: 500;
    color: ${cssVar.colorText};
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  score: css`
    font-family: monospace;
    font-size: 14px;
    font-weight: 600;
    color: ${cssVar.colorText};
  `,
  separator: css`
    color: ${cssVar.colorBorder};
  `,
  stat: css`
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 13px;
  `,
}));

interface RunCardProps {
  benchmarkId: string;
  run: any;
}

const RunCard = memo<RunCardProps>(({ benchmarkId, run }) => {
  const progress = run.totalCases > 0 ? (run.completedCases / run.totalCases) * 100 : 0;
  const passRate = run.completedCases > 0 ? (run.passCount / run.completedCases) * 100 : 0;
  const hasStats =
    (run.status === 'completed' || run.status === 'running') && run.completedCases > 0;

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  return (
    <Link style={{ textDecoration: 'none' }} to={`/eval/bench/${benchmarkId}/runs/${run.id}`}>
      <Card className={styles.card}>
        <Flexbox align="center" gap={16} horizontal>
          {/* Left: Info */}
          <Flexbox flex={1} gap={4} style={{ minWidth: 0 }}>
            <Flexbox align="center" gap={8} horizontal>
              <span className={styles.name}>{run.name}</span>
              <StatusBadge status={run.status} />
            </Flexbox>
            <Flexbox align="center" className={styles.meta} gap={4} horizontal>
              {run.model && <span style={{ fontFamily: 'monospace' }}>{run.model}</span>}
              {run.model && run.agentName && <span className={styles.separator}>/</span>}
              {run.agentName && <span>{run.agentName}</span>}
              {run.temperature !== undefined && (
                <>
                  <span className={styles.separator}>/</span>
                  <span>T={run.temperature}</span>
                </>
              )}
              {run.createdAt && (
                <>
                  <span className={styles.separator}>/</span>
                  <span>{formatDate(run.createdAt)}</span>
                </>
              )}
            </Flexbox>
          </Flexbox>

          {/* Center: Progress (visible for running) */}
          {run.status === 'running' && (
            <Flexbox gap={4} style={{ width: 144 }}>
              <Flexbox align="center" horizontal justify="space-between">
                <span className={styles.meta}>
                  {run.completedCases}/{run.totalCases}
                </span>
                <span className={styles.meta}>{progress.toFixed(0)}%</span>
              </Flexbox>
              <Progress percent={progress} showInfo={false} size="small" />
            </Flexbox>
          )}

          {/* Right: Stats */}
          {hasStats && (
            <Flexbox align="center" gap={12} horizontal>
              <span className={styles.stat} style={{ color: 'var(--ant-color-success)' }}>
                <Icon icon={CheckCircle2} size={14} />
                {run.passCount}
              </span>
              <span className={styles.stat} style={{ color: 'var(--ant-color-error)' }}>
                <Icon icon={XCircle} size={14} />
                {run.failCount}
              </span>
              {run.errorCount > 0 && (
                <span className={styles.stat} style={{ color: 'var(--ant-color-warning)' }}>
                  <Icon icon={AlertTriangle} size={14} />
                  {run.errorCount}
                </span>
              )}
              <Flexbox gap={2} style={{ minWidth: 60, textAlign: 'right' }}>
                <span className={styles.score}>{(run.metrics?.score || 0).toFixed(1)}</span>
                <span style={{ color: 'var(--ant-color-text-tertiary)', fontSize: 10 }}>
                  {passRate.toFixed(0)}% pass
                </span>
              </Flexbox>
            </Flexbox>
          )}

          {/* Duration & Cost (completed only) */}
          {run.status === 'completed' && (
            <Flexbox align="center" className={styles.meta} gap={12} horizontal>
              <span style={{ alignItems: 'center', display: 'flex', gap: 4 }}>
                <Icon icon={Clock} size={12} />
                {((run.totalDuration || 0) / 60).toFixed(1)}m
              </span>
              <span style={{ alignItems: 'center', display: 'flex', gap: 4 }}>
                <Icon icon={DollarSign} size={12} />${(run.totalCost || 0).toFixed(2)}
              </span>
            </Flexbox>
          )}

          <Icon
            icon={ArrowRight}
            size={16}
            style={{ color: 'var(--ant-color-text-tertiary)', flexShrink: 0 }}
          />
        </Flexbox>
      </Card>
    </Link>
  );
});

export default RunCard;
