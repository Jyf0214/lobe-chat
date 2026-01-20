'use client';

import { Icon, Tag } from '@lobehub/ui';
import qs from 'query-string';
import { memo, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { SCROLL_PARENT_ID } from '@/app/[variants]/(main)/community/features/const';
import { withSuspense } from '@/components/withSuspense';
import { useQuery } from '@/hooks/useQuery';
import { useDiscoverStore } from '@/store/discover';
import { StyleSheet } from '@/utils/styles';

import CategoryMenu from '../../../../components/CategoryMenu';
import { useCategory } from './useCategory';

const styles = StyleSheet.create({
  spacing: {
    borderRadius: 12,
    paddingInline: 6,
  },
});

const Category = memo(() => {
  const useModelCategories = useDiscoverStore((s) => s.useModelCategories);
  const { category = 'all', q } = useQuery() as { category?: string; q?: string };
  const { data: items = [] } = useModelCategories({ q });
  const navigate = useNavigate();
  const cates = useCategory();

  const genUrl = (key: string) =>
    qs.stringifyUrl(
      {
        query: { category: key === 'all' ? null : key, q },
        url: '/community/model',
      },
      { skipNull: true },
    );

  const handleClick = (key: string) => {
    navigate(genUrl(key));
    const scrollableElement = document?.querySelector(`#${SCROLL_PARENT_ID}`);
    if (!scrollableElement) return;
    scrollableElement.scrollTo({ behavior: 'smooth', top: 0 });
  };
  const total = useMemo(() => items.reduce((acc, item) => acc + item.count, 0), [items]);

  return (
    <CategoryMenu
      items={cates.map((item) => {
        const itemData = items.find((i) => i.category === item.key);
        return {
          extra:
            item.key === 'all'
              ? total > 0 && (
                  <Tag size={'small'} style={styles.spacing}>
                    {total}
                  </Tag>
                )
              : itemData && (
                  <Tag size={'small'} style={styles.spacing}>
                    {itemData.count}
                  </Tag>
                ),
          ...item,
          icon: <Icon icon={item.icon} size={18} />,
          label: <Link to={genUrl(item.key)}>{item.label}</Link>,
        };
      })}
      mode={'inline'}
      onClick={(v) => handleClick(v.key as string)}
      selectedKeys={[category]}
    />
  );
});

export default withSuspense(Category);
