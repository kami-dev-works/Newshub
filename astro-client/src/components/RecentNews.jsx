import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { newsApi } from '../lib/api';
import NewsList from './NewsList';

const RecentNews = ({ category, setCategory, sort, setSort }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentNews = async () => {
      setLoading(true);
      try {
        const response = await newsApi.getRecent();
        setNews(response.data);
      } catch (err) {
        console.error('Failed to fetch recent news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentNews();
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

export default RecentNews;