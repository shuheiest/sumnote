import { useState, useMemo } from 'react';
import { FilterOptions } from '../components/ContentFilters';

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export const useContentFilters = <T extends ContentItem>(items: T[]) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    sortBy: 'newest',
    sortOrder: 'desc',
    filterType: 'all',
  });

  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

    // 検索フィルター
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm) ||
          (item.description && item.description.toLowerCase().includes(searchTerm))
      );
    }

    // 日付フィルター
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (filters.filterType) {
      case 'recent':
        // 直近3日
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          (item) => new Date(item.createdAt) >= threeDaysAgo
        );
        break;
      case 'thisWeek':
        filtered = filtered.filter(
          (item) => new Date(item.createdAt) >= oneWeekAgo
        );
        break;
      case 'thisMonth':
        filtered = filtered.filter(
          (item) => new Date(item.createdAt) >= oneMonthAgo
        );
        break;
      case 'all':
      default:
        // フィルターなし
        break;
    }

    // ソート
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title, 'ja');
          break;
        case 'oldest':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          const aUpdated = a.updatedAt || a.createdAt;
          const bUpdated = b.updatedAt || b.createdAt;
          comparison = new Date(aUpdated).getTime() - new Date(bUpdated).getTime();
          break;
        case 'newest':
        default:
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }

      // 昇順・降順の調整
      if (filters.sortBy === 'oldest') {
        // oldestの場合は既に昇順なので、descの場合のみ反転
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      } else {
        // その他の場合は基本的に降順がデフォルト
        return filters.sortOrder === 'asc' ? -comparison : comparison;
      }
    });

    return filtered;
  }, [items, filters]);

  return {
    filters,
    setFilters,
    filteredItems: filteredAndSortedItems,
    totalCount: items.length,
    filteredCount: filteredAndSortedItems.length,
  };
};