import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Chip, ToggleButton, ToggleButtonGroup, useMediaQuery, useTheme } from '@mui/material';
import { ViewList, ViewModule } from '@mui/icons-material';
import { newsApi } from '../lib/api';
import NewsList from './NewsList';
import { useLanguage } from '../stores/LanguageContext';

const AllNews = ({ category, setCategory, sort, setSort }) => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState('list');

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        sort,
      };
      
      if (category && category !== 'all') {
        params.category = category;
      }
      
      if (search) {
        params.search = search;
      }

      const response = await newsApi.getAll(params);
      setNews(response.data.news);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to fetch news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [page, category, sort, search]);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (categoryParam && categoryParam !== category) {
      setCategory(categoryParam);
    }
    if (searchParam && searchParam !== search) {
      setSearch(searchParam);
    }
  }, [searchParams]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setPage(1);
    
    const params = new URLSearchParams(searchParams);
    if (newCategory === 'all') {
      params.delete('category');
    } else {
      params.set('category', newCategory);
    }
    setSearchParams(params);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
  };

  const handleViewModeChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  return (
    <Box>
      {search && (
        <Chip
          label={`${t('searchNews')}: ${search}`}
          onDelete={() => {
            setSearch('');
            setSearchParams({});
          }}
          color="primary"
          sx={{ mb: 2 }}
        />
      )}
      
      {isDesktop && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            aria-label="view mode"
          >
            <ToggleButton value="list" aria-label="list view">
              <ViewList sx={{ mr: 0.5 }} />
              List
            </ToggleButton>
            <ToggleButton value="grid" aria-label="grid view">
              <ViewModule sx={{ mr: 0.5 }} />
              Grid
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}
      
      <NewsList
        news={news}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onUpdate={(updated) => {
          setNews(news.map(n => n._id === updated._id ? updated : n));
        }}
        viewMode={viewMode}
      />
    </Box>
  );
};

export default AllNews;