import { useState, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';
import { newsApi } from '../lib/api';
import NewsList from './NewsList';

const TopNews = ({ category, setCategory, sort, setSort }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopNews = async () => {
      setLoading(true);
      try {
        const response = await newsApi.getTop();
        setNews(response.data);
      } catch (err) {
        console.error('Failed to fetch top news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopNews();
  }, []);

  return (
    <Box>
      <NewsList
        news={news}
        loading={loading}
        showPagination={false}
        onUpdate={(updated) => {
          setNews(news.map(n => n._id === updated._id ? updated : n));
        }}
      />
    </Box>
  );
};

export default TopNews;