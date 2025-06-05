import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  InputAdornment,
  Chip,
  IconButton,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

export interface FilterOptions {
  searchTerm: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filterType: string;
}

interface ContentFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  contentType: 'documents' | 'audios';
  totalCount: number;
  filteredCount: number;
}

export const ContentFilters: React.FC<ContentFiltersProps> = ({
  filters,
  onFiltersChange,
  contentType,
  totalCount,
  filteredCount,
}) => {
  const handleSearchChange = (searchTerm: string) => {
    onFiltersChange({ ...filters, searchTerm });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    onFiltersChange({ ...filters, sortOrder });
  };

  const handleFilterTypeChange = (filterType: string) => {
    onFiltersChange({ ...filters, filterType });
  };

  const clearSearch = () => {
    onFiltersChange({ ...filters, searchTerm: '' });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: '',
      sortBy: 'newest',
      sortOrder: 'desc',
      filterType: 'all',
    });
  };

  const hasActiveFilters = filters.searchTerm || filters.filterType !== 'all' || filters.sortBy !== 'newest';

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={3} alignItems="center">
        {/* 検索フィールド */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder={`${contentType === 'documents' ? 'ドキュメント' : '音声ファイル'}を検索...`}
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              endAdornment: filters.searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={clearSearch} size="small" edge="end">
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="small"
          />
        </Grid>

        {/* 並び順 */}
        <Grid item xs={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>並び順</InputLabel>
            <Select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              label="並び順"
            >
              <MenuItem value="newest">新しい順</MenuItem>
              <MenuItem value="oldest">古い順</MenuItem>
              <MenuItem value="title">タイトル順</MenuItem>
              <MenuItem value="updated">更新日順</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* 昇順・降順 */}
        <Grid item xs={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>順序</InputLabel>
            <Select
              value={filters.sortOrder}
              onChange={(e) => handleSortOrderChange(e.target.value as 'asc' | 'desc')}
              label="順序"
            >
              <MenuItem value="desc">降順</MenuItem>
              <MenuItem value="asc">昇順</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* フィルタータイプ */}
        <Grid item xs={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>フィルター</InputLabel>
            <Select
              value={filters.filterType}
              onChange={(e) => handleFilterTypeChange(e.target.value)}
              label="フィルター"
            >
              <MenuItem value="all">すべて</MenuItem>
              <MenuItem value="recent">最近のもの</MenuItem>
              <MenuItem value="thisWeek">今週</MenuItem>
              <MenuItem value="thisMonth">今月</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* 結果表示とフィルタークリア */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Box display="flex" gap={1} alignItems="center">
          <Chip
            label={`${filteredCount} / ${totalCount} 件`}
            size="small"
            color={filteredCount < totalCount ? 'primary' : 'default'}
          />
          {hasActiveFilters && (
            <Chip
              label="フィルターをクリア"
              size="small"
              variant="outlined"
              onClick={clearAllFilters}
              onDelete={clearAllFilters}
              deleteIcon={<Clear />}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
};