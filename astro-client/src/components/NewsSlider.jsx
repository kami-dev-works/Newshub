import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, IconButton, Chip, Skeleton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeContext } from '../stores/ThemeContext';
import { useLanguage } from '../stores/LanguageContext';
import { newsApi } from '../lib/api';
import { toNewsSlug } from '../lib/slug';

const NewsSlider = () => {
  const { isDark } = useThemeContext();
  const { t } = useLanguage();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const response = await newsApi.getAll({ limit: 5, sort: '-createdAt' });
        setNews(response.data.news);
      } catch (err) {
        console.error('Failed to fetch latest news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestNews();
  }, []);

  useEffect(() => {
    autoPlayRef.current = () => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % news.length);
    };
  }, [news.length]);

  useEffect(() => {
    const play = () => {
      autoPlayRef.current?.();
    };

    const interval = setInterval(play, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', height: 400, position: 'relative', overflow: 'hidden' }}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>
    );
  }

  if (news.length === 0) {
    return null;
  }

  const currentNews = news[currentIndex];

  return (
    <Box
      sx={{
        width: { xs: 'calc(100% + 16px)', sm: '100%' },
        height: { xs: 300, sm: 400, md: 450 },
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 0, md: 2 },
        mx: { xs: -2, sm: 0 },
      }}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Box
            component={Link}
            to={`/news/${toNewsSlug(currentNews.title, currentNews._id, currentNews.shortId)}`}
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              position: 'relative',
              textDecoration: 'none',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${currentNews.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 0.5s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%)',
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: { xs: 2, sm: 4, md: 5 },
              }}
            >
              <Chip
                label={currentNews.category?.toUpperCase() || 'NEWS'}
                size="small"
                sx={{
                  mb: 2,
                  bgcolor: isDark ? 'rgba(168, 85, 247, 0.9)' : 'rgba(13, 148, 136, 0.9)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#fff',
                  mb: 1,
                  fontFamily: 'Poppins',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                {currentNews.title}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  mb: 2,
                  display: { xs: 'none', sm: 'block' },
                  maxWidth: 600,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                {currentNews.description?.substring(0, 150)}...
              </Typography>

              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {new Date(currentNews.createdAt).toLocaleDateString()} • {currentNews.views || 0} {t('views')}
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </AnimatePresence>

      <IconButton
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          left: { xs: 8, sm: 16 },
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(0,0,0,0.5)',
          color: '#fff',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
        }}
      >
        <ChevronLeft />
      </IconButton>

      <IconButton
        onClick={handleNext}
        sx={{
          position: 'absolute',
          right: { xs: 8, sm: 16 },
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(0,0,0,0.5)',
          color: '#fff',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
        }}
      >
        <ChevronRight />
      </IconButton>

      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 16, sm: 24 },
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
        }}
      >
        {news.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentIndex(index)}
            sx={{
              width: index === currentIndex ? 24 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: index === currentIndex ? '#fff' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#fff',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default NewsSlider;