import { Flexbox, Icon, SearchBar, Select } from '@lobehub/ui';
import { ArrowDownNarrowWide, Search } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { StyleSheet } from '@/utils/styles';

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  spacing: {
    marginRight: 4,
  },
  style: {
    minWidth: 150,
  },
});

interface SortOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  onSearch: (value: string) => void;
  onSortChange?: (sort: string) => void;
  searchValue: string;
  sortOptions?: SortOption[];
  sortValue?: string;
}

const FilterBar = memo<FilterBarProps>(
  ({ searchValue, onSearch, sortValue, onSortChange, sortOptions }) => {
    const { t } = useTranslation('memory');

    return (
      <Flexbox align={'center'} gap={12} horizontal>
        <SearchBar
          allowClear
          defaultValue={searchValue}
          onInputChange={(v) => {
            if (!v) {
              onSearch(v);
            }
          }}
          onSearch={(v) => onSearch(v)}
          placeholder={t('filter.search')}
          prefix={<Search size={16} />}
          style={styles.flexContainer}
        />
        {sortOptions && sortOptions.length > 0 && onSortChange && (
          <Select
            onChange={(value) => onSortChange(value as string)}
            options={sortOptions}
            prefix={<Icon icon={ArrowDownNarrowWide} style={styles.spacing} />}
            style={styles.style}
            value={sortValue}
          />
        )}
      </Flexbox>
    );
  },
);

export default FilterBar;
