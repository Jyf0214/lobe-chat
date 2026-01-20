import { ActionIcon, Button, DropdownMenu, Flexbox, Skeleton, Text } from '@lobehub/ui';
import { App, Space } from 'antd';
import { cssVar } from 'antd-style';
import { CircleX, EllipsisVertical, LucideRefreshCcwDot, PlusIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useAiInfraStore } from '@/store/aiInfra';
import { aiModelSelectors } from '@/store/aiInfra/selectors';
import { StyleSheet } from '@/utils/styles';

import CreateNewModelModal from '../CreateNewModelModal';
import Search from './Search';

const styles = StyleSheet.create({
  flexContainer: {
    display: 'flex',
    lineHeight: '24px',
  },
  spacing: {
    background: cssVar.colorBgContainer,
    position: 'sticky',
    zIndex: 15,
  },
  style: {
    fontSize: 16,
  },
  style1: {
    height: 22,
  },
  style2: {
    fontSize: 12,
  },
  style3: {
    width: 120,
  },
});

interface ModelFetcherProps {
  provider: string;
  showAddNewModel?: boolean;
  showModelFetcher?: boolean;
}

const ModelTitle = memo<ModelFetcherProps>(
  ({ provider, showAddNewModel = true, showModelFetcher = true }) => {
    const { t } = useTranslation('modelProvider');
    const { modal, message } = App.useApp();
    const [
      searchKeyword,
      totalModels,
      isEmpty,
      hasRemoteModels,
      fetchRemoteModelList,
      clearObtainedModels,
      clearModelsByProvider,
      useFetchAiProviderModels,
    ] = useAiInfraStore((s) => [
      s.modelSearchKeyword,
      aiModelSelectors.totalAiProviderModelList(s),
      aiModelSelectors.isEmptyAiProviderModelList(s),
      aiModelSelectors.hasRemoteModels(s),
      s.fetchRemoteModelList,
      s.clearRemoteModels,
      s.clearModelsByProvider,
      s.useFetchAiProviderModels,
    ]);

    const { isLoading } = useFetchAiProviderModels(provider);

    const [fetchRemoteModelsLoading, setFetchRemoteModelsLoading] = useState(false);
    const [clearRemoteModelsLoading, setClearRemoteModelsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const mobile = useIsMobile();
    const spacingStyle = {
      ...styles.spacing,
      marginTop: mobile ? 0 : -12,
      paddingTop: mobile ? 0 : 20,
      top: mobile ? -2 : -32,
    };

    return (
      <Flexbox gap={12} paddingBlock={8} style={spacingStyle}>
        <Flexbox align={'center'} gap={0} horizontal justify={'space-between'}>
          <Flexbox align={'center'} gap={8} horizontal>
            <Text strong style={styles.style}>
              {t('providerModels.list.title')}
            </Text>

            {isLoading ? (
              <Skeleton.Button active style={styles.style1} />
            ) : (
              <Text style={styles.style2} type={'secondary'}>
                <div style={styles.flexContainer}>
                  {t('providerModels.list.total', { count: totalModels })}
                  {hasRemoteModels && (
                    <ActionIcon
                      icon={CircleX}
                      loading={clearRemoteModelsLoading}
                      onClick={async () => {
                        setClearRemoteModelsLoading(true);
                        await clearObtainedModels(provider);
                        setClearRemoteModelsLoading(false);
                      }}
                      size={'small'}
                      title={t('providerModels.list.fetcher.clear')}
                    />
                  )}
                </div>
              </Text>
            )}
          </Flexbox>
          {isLoading ? (
            <Skeleton.Button active size={'small'} style={styles.style3} />
          ) : isEmpty ? null : (
            <Flexbox gap={8} horizontal>
              {!mobile && (
                <Search
                  onChange={(value) => {
                    useAiInfraStore.setState({ modelSearchKeyword: value });
                  }}
                  value={searchKeyword}
                />
              )}
              <Space.Compact>
                {showModelFetcher && (
                  <Button
                    icon={LucideRefreshCcwDot}
                    loading={fetchRemoteModelsLoading}
                    onClick={async () => {
                      setFetchRemoteModelsLoading(true);
                      try {
                        await fetchRemoteModelList(provider);
                      } catch (e) {
                        console.error(e);
                      }
                      setFetchRemoteModelsLoading(false);
                    }}
                    size={'small'}
                  >
                    {fetchRemoteModelsLoading
                      ? t('providerModels.list.fetcher.fetching')
                      : t('providerModels.list.fetcher.fetch')}
                  </Button>
                )}
                {showAddNewModel && (
                  <>
                    <Button
                      icon={PlusIcon}
                      onClick={() => {
                        setShowModal(true);
                      }}
                      size={'small'}
                    />
                    <CreateNewModelModal open={showModal} setOpen={setShowModal} />
                  </>
                )}
                <DropdownMenu
                  items={[
                    {
                      key: 'reset',
                      label: t('providerModels.list.resetAll.title'),
                      onClick: async () => {
                        modal.confirm({
                          content: t('providerModels.list.resetAll.conform'),
                          onOk: async () => {
                            await clearModelsByProvider(provider);
                            message.success(t('providerModels.list.resetAll.success'));
                          },
                          title: t('providerModels.list.resetAll.title'),
                        });
                      },
                    },
                  ]}
                >
                  <Button icon={EllipsisVertical} size={'small'} />
                </DropdownMenu>
              </Space.Compact>
            </Flexbox>
          )}
        </Flexbox>

        {mobile && (
          <Search
            onChange={(value) => {
              useAiInfraStore.setState({ modelSearchKeyword: value });
            }}
            value={searchKeyword}
            variant={'filled'}
          />
        )}
      </Flexbox>
    );
  },
);
export default ModelTitle;
