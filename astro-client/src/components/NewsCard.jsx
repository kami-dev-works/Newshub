import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  MoreVert,
  Visibility,
  Favorite,
  Comment,
  Share,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useThemeContext } from '../stores/ThemeContext';
import { useData } from '../stores/DataContext';
import { useLanguage } from '../stores/LanguageContext';
import { newsApi } from '../lib/api';
import { toNewsSlug } from '../lib/slug';

const NewsCard = ({ news, onUpdate, viewMode = 'list' }) => {
  const { isDark } = useThemeContext();
  const { isAuthenticated, user, showToast, refreshUser } = useData();
  const { t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(news.likes?.length || 0);
  const [liking, setLiking] = useState(false);
  const prevNewsId = useRef(news._id);
  const prevUserId = useRef(user?._id);

  useEffect(() => {
    let changed = false;
    if (prevNewsId.current !== news._id) {
      prevNewsId.current = news._id;
      changed = true;
    }
    if (prevUserId.current !== user?._id) {
      prevUserId.current = user?._id;
      changed = true;
    }
    if (!changed) return;
    const userId = user?._id;
    if (!userId) {
      setLikeCount(news.likes?.length || 0);
      setIsLiked(false);
      return;
    }
    if (Array.isArray(news.likes)) {
      const liked = news.likes.some(like => (like._id || like).toString() === userId.toString());
      setIsLiked(liked);
      setLikeCount(news.likes.length);
    } else {
      const likedFromUser = user?.likedNews?.some(id => (id._id || id).toString() === news._id.toString());
      setIsLiked(likedFromUser);
    }
  }, [user, news.likes, news._id, user?.likedNews]);

  const handleMenuOpen = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Please login to like news', 'warning');
      return;
    }
    try {
      if (liking) return;
      setLiking(true);
      const response = await newsApi.like(news._id);
      setIsLiked(response.data.liked);
      setLikeCount(response.data.likes);
      if (onUpdate) {
        const userId = user._id.toString();
        if (response.data.liked) {
          onUpdate({ ...news, likes: [...(news.likes || []), userId] });
        } else {
          onUpdate({ ...news, likes: (news.likes || []).filter(id => (id._id || id).toString() !== userId) });
        }
      }
      if (refreshUser) {
        refreshUser();
      }
    } catch (err) {
      showToast('Failed to like news', 'error');
    } finally {
      setLiking(false);
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.description,
        url: window.location.origin + `/news/${toNewsSlug(news.title, news._id, news.shortId)}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/news/${toNewsSlug(news.title, news._id, news.shortId)}`);
      showToast('Link copied to clipboard!', 'success');
    }
    handleMenuClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        component={Link}
        to={`/news/${toNewsSlug(news.title, news._id, news.shortId)}`}
        sx={{
          textDecoration: 'none',
          display: 'flex',
          flexDirection: viewMode === 'grid' ? 'column' : { xs: 'column', sm: 'row' },
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          transition: 'all 0.3s ease',
          mb: viewMode === 'grid' ? 0 : 2,
          height: viewMode === 'grid' ? '100%' : 'auto',
          '&:hover': {
            boxShadow: isDark
              ? '0 8px 24px rgba(0,0,0,0.4)'
              : '0 8px 24px rgba(0,0,0,0.1)',
            '& .card-image': {
              transform: 'scale(1.02)',
            },
          },
        }}
      >
        {viewMode === 'grid' && (
          <Box
            sx={{
              width: '100%',
              height: 180,
              position: 'relative',
            }}
          >
            <CardMedia
              component="img"
              image={news.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800'}
              alt={news.title}
              className="card-image"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.5s ease',
              }}
            />
          </Box>
        )}
        
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Chip
                label={news.category?.toUpperCase() || 'NEWS'}
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(168, 85, 247, 0.9)' : 'rgba(13, 148, 136, 0.9)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.65rem',
                }}
              />
              {news.isFeatured && (
                <Chip
                  label="HOT"
                  size="small"
                  color="error"
                  sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                />
              )}
            </Box>

            <Typography
              gutterBottom
              variant="h6"
              component="h3"
              sx={{
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 600,
                lineHeight: 1.3,
                mb: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                color: 'text.primary',
              }}
            >
              {news.title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                flexGrow: 1,
              }}
            >
              {news.description || t('clickToReadMore')}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pt: 1,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Tooltip title="Views">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Visibility fontSize="small" sx={{ opacity: 0.7 }} />
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {news.views || 0}
                    </Typography>
                  </Box>
                </Tooltip>

                <Tooltip title={isLiked ? 'Unlike' : 'Like'}>
                    <Box
                      component="button"
                      onClick={handleLike}
                      disabled={liking}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        border: 'none',
                        bgcolor: 'transparent',
                        cursor: liking ? 'default' : 'pointer',
                        color: isLiked ? 'error.main' : 'inherit',
                        transition: 'color 0.2s ease',
                        opacity: liking ? 0.6 : 1,
                        '&:hover': { color: liking ? 'inherit' : 'error.main' },
                      }}
                    >
                    <Favorite fontSize="small" sx={{ opacity: 0.7 }} />
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {likeCount}
                    </Typography>
                  </Box>
                </Tooltip>

                <Tooltip title="Comments">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Comment fontSize="small" sx={{ opacity: 0.7 }} />
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {news.comments?.length || 0}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(news.createdAt).toLocaleDateString()}
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  sx={{
                    p: 0.5,
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' },
                  }}
                  aria-label="more options"
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Box>

        {viewMode !== 'grid' && (
          <Box
            sx={{
              flex: { xs: '0 0 100%', sm: '0 0 35%' },
              height: { xs: 200, sm: 'auto' },
              minHeight: { sm: 160 },
              position: 'relative',
              order: { xs: -1, sm: 1 },
            }}
          >
            <CardMedia
              component="img"
              image={news.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800'}
              alt={news.title}
              className="card-image"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.5s ease',
              }}
            />
          </Box>
        )}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{ sx: { minWidth: 150 } }}
        >
          <MenuItem onClick={handleShare}>
            <Share fontSize="small" sx={{ mr: 1 }} />
            Share
          </MenuItem>
        </Menu>
      </Card>
    </motion.div>
  );
};

export default NewsCard;