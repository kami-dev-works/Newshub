import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Favorite } from '@mui/icons-material';
import { userApi } from '../lib/api';
import NewsList from './NewsList';
import { useLanguage } from '../stores/LanguageContext';
import { useData } from '../stores/DataContext';

const LikedNews = ({ category, setCategory, sort, setSort }) => {
  const { t } = useLanguage();
  const { isAuthenticated, loading: authLoading, user } = useData();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLikedNews = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await userApi.getLiked();
      setNews(response.data);
    } catch (err) {
      console.error('Failed to fetch liked news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedNews();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {t('loginRequired')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('pleaseLogin')}
        </Typography>
        <Button component={Link} to="/login" variant="contained">
          {t('login')}
        </Button>
      </Container>
    );
  }

  if (news.length === 0 && !loading) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          bgcolor: 'background.paper',
          borderRadius: 3,
        }}
      >
        <Favorite sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {t('noLikedNews')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('startExploring')}
        </Typography>
        <Button component={Link} to="/" variant="contained">
          {t('browseNews')}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <NewsList
        news={news}
        loading={loading || authLoading}
        showPagination={false}
        onUpdate={(updated) => {
          setNews(prevNews => prevNews.filter(n => n._id !== updated._id));
        }}
      />
    </Box>
  );
};

export default LikedNews;