'use client';

import { ActionIcon, Flexbox, Text, TooltipGroup } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { ToggleRightIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';
import { StyleSheet } from '@/utils/styles';

import ModelItem from './ModelItem';

const styles = StyleSheet.create({
  spacing: {
    fontSize: 12,
    marginTop: 8,
  },
});

const SearchResult = memo(() => {
  const { t } = useTranslation('modelProvider');

  const searchKeyword = useAiInfraStore((s) => s.modelSearchKeyword);
  const batchToggleAiModels = useAiInfraStore((s) => s.batchToggleAiModels);

  const filteredModels = useAiInfraStore(aiModelSelectors.filteredAiProviderModelList, isEqual);
  console.log('filteredModels:', filteredModels);
  const [batchLoading, setBatchLoading] = useState(false);

  const isEmpty = filteredModels.length === 0;
  return (
    <>
      <Flexbox horizontal justify={'space-between'}>
        <Text style={styles.spacing} type={'secondary'}>
          {t('providerModels.list.searchResult', { count: filteredModels.length })}
        </Text>
        {!isEmpty && (
          <Flexbox horizontal>
            <ActionIcon
              icon={ToggleRightIcon}
              loading={batchLoading}
              onClick={async () => {
                setBatchLoading(true);
                await batchToggleAiModels(
                  filteredModels.map((i) => i.id),
                  true,
                );
                setBatchLoading(false);
              }}
              size={'small'}
              title={t('providerModels.list.enabledActions.enableAll')}
            />
          </Flexbox>
        )}
      </Flexbox>

      {searchKeyword && isEmpty ? (
        <Flexbox align="center" justify="center" padding={16}>
          {t('providerModels.searchNotFound')}
        </Flexbox>
      ) : (
        <TooltipGroup>
          <Flexbox gap={4}>
            {filteredModels.map((item) => (
              <ModelItem {...item} key={`${item.id}-${item.enabled}`} />
            ))}
          </Flexbox>
        </TooltipGroup>
      )}
    </>
  );
});

export default SearchResult;
