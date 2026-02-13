'use client';

import { Button, Flexbox } from '@lobehub/ui';
import { Plus } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useEvalStore } from '@/store/eval';

import RunCreateModal from '../RunCreateModal';
import EmptyState from './EmptyState';
import RunCard from './RunCard';

interface RunsTabProps {
  benchmarkId: string;
}

const RunsTab = memo<RunsTabProps>(({ benchmarkId }) => {
  const { t } = useTranslation('eval');
  const [createRunOpen, setCreateRunOpen] = useState(false);
  const useFetchRuns = useEvalStore((s) => s.useFetchRuns);
  const runList = useEvalStore((s) => s.runList);
  useFetchRuns(undefined);

  const sortedRuns = useMemo(
    () =>
      [...runList].sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [runList],
  );

  return (
    <>
      <Flexbox gap={16}>
        {sortedRuns.length > 0 && (
          <Flexbox align="center" horizontal justify="space-between">
            <p style={{ color: 'var(--ant-color-text-tertiary)', fontSize: 14, margin: 0 }}>
              {t('benchmark.detail.runCount', { count: runList.length })}
            </p>
            <Button
              icon={Plus}
              onClick={() => setCreateRunOpen(true)}
              size="small"
              type="primary"
            >
              {t('run.actions.create')}
            </Button>
          </Flexbox>
        )}

        {sortedRuns.length === 0 ? (
          <EmptyState onCreate={() => setCreateRunOpen(true)} />
        ) : (
          <Flexbox gap={12}>
            {sortedRuns.map((run: any) => (
              <RunCard benchmarkId={benchmarkId} key={run.id} run={run} />
            ))}
          </Flexbox>
        )}
      </Flexbox>

      <RunCreateModal
        benchmarkId={benchmarkId}
        onClose={() => setCreateRunOpen(false)}
        open={createRunOpen}
      />
    </>
  );
});

export default RunsTab;
