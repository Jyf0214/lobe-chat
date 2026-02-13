'use client';

import { DEFAULT_INBOX_AVATAR, INBOX_SESSION_ID, SESSION_CHAT_URL } from '@lobechat/const';
import { ActionIcon, Avatar } from '@lobehub/ui';
import { Button, Collapse, Form, Input, InputNumber, Modal, Select, Space } from 'antd';
import { SquareArrowOutUpRight } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { agentService } from '@/services/agent';
import { useEvalStore } from '@/store/eval';

interface AgentOption {
  avatar?: string | null;
  backgroundColor?: string | null;
  description?: string | null;
  id: string;
  title?: string | null;
}

interface RunCreateModalProps {
  benchmarkId: string;
  onClose: () => void;
  open: boolean;
}

const RunCreateModal = memo<RunCreateModalProps>(({ open, onClose, benchmarkId }) => {
  const { t } = useTranslation('eval');
  const { t: tChat } = useTranslation('chat');
  const navigate = useNavigate();
  const createRun = useEvalStore((s) => s.createRun);
  const startRun = useEvalStore((s) => s.startRun);
  const isCreatingRun = useEvalStore((s) => s.isCreatingRun);
  const datasetList = useEvalStore((s) => s.datasetList);
  const [form] = Form.useForm();

  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingAgents(true);
    agentService
      .queryAgents()
      .then((list) => setAgents(list as AgentOption[]))
      .finally(() => setLoadingAgents(false));
  }, [open]);

  const inboxAgent: AgentOption = useMemo(
    () => ({
      avatar: DEFAULT_INBOX_AVATAR,
      id: INBOX_SESSION_ID,
      title: tChat('inbox.title'),
    }),
    [tChat],
  );

  const allAgents = useMemo(() => [inboxAgent, ...agents], [inboxAgent, agents]);

  const agentOptions = useMemo(
    () =>
      allAgents.map((agent) => ({
        label: (
          <span style={{ alignItems: 'center', display: 'inline-flex', gap: 8 }}>
            <Avatar
              avatar={agent.avatar || undefined}
              background={agent.backgroundColor || undefined}
              size={20}
              title={agent.title || ''}
            />
            <span>{agent.title}</span>
          </span>
        ),
        searchLabel: agent.title || '',
        value: agent.id,
      })),
    [allAgents],
  );

  const handleOpenAgent = useCallback(
    (agentId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const url = SESSION_CHAT_URL(agentId);
      window.open(url, `agent_${agentId}`, 'noopener,noreferrer');
    },
    [],
  );

  const handleSubmit = async (shouldStart: boolean) => {
    const values = await form.validateFields();
    const run = await createRun({
      config: {
        concurrency: values.concurrency,
        timeout: values.timeout,
      },
      datasetId: values.datasetId,
      name: values.name,
      targetAgentId: values.targetAgentId,
    });
    if (run?.id) {
      if (shouldStart) {
        await startRun(run.id);
      }
      navigate(`/eval/bench/${benchmarkId}/runs/${run.id}`);
    }
    onClose();
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      footer={
        <Space>
          <Button onClick={handleClose}>{t('common.later')}</Button>
          <Button loading={isCreatingRun} onClick={() => handleSubmit(false)}>
            {t('run.create.createOnly')}
          </Button>
          <Button loading={isCreatingRun} onClick={() => handleSubmit(true)} type="primary">
            {t('run.create.confirm')}
          </Button>
        </Space>
      }
      onCancel={handleClose}
      open={open}
      title={t('run.create.title')}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label={t('run.create.dataset')}
          name="datasetId"
          rules={[{ message: t('run.create.dataset.required'), required: true }]}
        >
          <Select
            options={datasetList.map((ds) => ({
              label: (
                <Space>
                  <span>{ds.name}</span>
                  {ds.testCaseCount !== undefined && (
                    <span style={{ color: 'var(--ant-color-text-quaternary)', fontSize: 12 }}>
                      {t('run.create.caseCount', { count: ds.testCaseCount })}
                    </span>
                  )}
                </Space>
              ),
              value: ds.id,
            }))}
            placeholder={t('run.create.dataset.placeholder')}
            variant="filled"
          />
        </Form.Item>

        <Form.Item label={t('run.create.agent')} name="targetAgentId">
          <Select
            allowClear
            filterOption={(input, option) =>
              (option?.searchLabel as string)?.toLowerCase().includes(input.toLowerCase())
            }
            loading={loadingAgents}
            optionRender={(option) => (
              <span
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  gap: 8,
                  justifyContent: 'space-between',
                }}
              >
                {option.label}
                <ActionIcon
                  icon={SquareArrowOutUpRight}
                  onClick={(e) => handleOpenAgent(option.value as string, e)}
                  size="small"
                />
              </span>
            )}
            options={agentOptions}
            placeholder={t('run.create.agent.placeholder')}
            showSearch
            variant="filled"
          />
        </Form.Item>

        <Form.Item label={t('run.create.name')} name="name">
          <Input placeholder={t('run.create.name.placeholder')} variant="filled" />
        </Form.Item>

        <Collapse
          ghost
          items={[
            {
              children: (
                <>
                  <Form.Item
                    initialValue={5}
                    label={t('run.config.concurrency')}
                    name="concurrency"
                  >
                    <InputNumber max={10} min={1} style={{ width: '100%' }} variant="filled" />
                  </Form.Item>
                  <Form.Item
                    initialValue={300_000}
                    label={t('run.config.timeout')}
                    name="timeout"
                  >
                    <InputNumber min={30_000} step={30_000} style={{ width: '100%' }} variant="filled" />
                  </Form.Item>
                </>
              ),
              key: 'advanced',
              label: t('run.create.advanced'),
            },
          ]}
        />
      </Form>
    </Modal>
  );
});

export default RunCreateModal;
