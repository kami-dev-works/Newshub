import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Chip,
  IconButton,
  Button,
  Divider,
  Skeleton,
  TextField,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  Visibility,
  Favorite,
  Comment,
  Share,
  Twitter,
  Facebook,
  LinkedIn,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useThemeContext } from '../stores/ThemeContext';
import { useLanguage } from '../stores/LanguageContext';
import { useData } from '../stores/DataContext';
import { newsApi, commentApi } from '../lib/api';
import { parseNewsSlug } from '../lib/slug';
import NewsCard from './NewsCard';

const NewsDetail = () => {
  const { slug } = useParams();
  const shortId = parseNewsSlug(slug);
  const { isDark } = useThemeContext();
  const { t } = useLanguage();
  const { isAuthenticated, user, showToast, refreshUser } = useData();

  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const response = await newsApi.getByShortId(shortId);
        const newsData = response.data;
        setNews(newsData);

        const userId = user?._id;
        if (userId) {
          const liked = newsData.likes?.some(
            (like) => like.toString() === userId.toString()
          ) || user?.likedNews?.some((lid) => lid.toString() === newsData._id.toString());
          setIsLiked(liked);
        }

        const [commentsRes, relatedRes] = await Promise.all([
          commentApi.getByNews(newsData._id),
          newsData.category ? newsApi.getAll({ category: newsData.category, limit: 4 }) : Promise.resolve(null),
        ]);
        setComments(commentsRes.data);
        if (relatedRes) {
          setRelatedNews(relatedRes.data.news.filter((n) => n._id !== newsData._id));
        }
      } catch (err) {
        console.error('Failed to fetch news:', err);
        showToast('Failed to load news', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [shortId, user]);

  const handleLike = async () => {
    if (!isAuthenticated || !news) {
      showToast(t('pleaseLogin'), 'warning');
      return;
    }
    try {
      const response = await newsApi.like(news._id);
      setIsLiked(response.data.liked);
      if (refreshUser) {
        refreshUser();
      }
    } catch (err) {
      showToast('Failed to like news', 'error');
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = news.title;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      showToast(t('share') + '!', 'success');
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast(t('pleaseLogin'), 'warning');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await commentApi.create(news._id, newComment);
      setComments([...comments, response.data]);
      setNewComment('');
      showToast(t('success'), 'success');
    } catch (err) {
      showToast('Failed to add comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 4 }} />
        <Skeleton variant="text" width="60%" height={48} />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
      </Container>
    );
  }

  if (!news) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          News not found
        </Typography>
        <Button component={Link} to="/" variant="contained">
          Go Home
        </Button>
      </Container>
    );
  }

  return (
    <Box>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBack />}
          sx={{ mb: 3 }}
        >
          {t('home')}
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: { xs: 250, sm: 400, md: 500 },
              borderRadius: 3,
              overflow: 'hidden',
              mb: 4,
            }}
          >
            <Box
              component="img"
              src={news.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200'}
              alt={news.title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: { xs: 2, sm: 4 },
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label={news.category?.toUpperCase() || 'NEWS'}
                  size="small"
                  sx={{
                    bgcolor: isDark ? 'rgba(168, 85, 247, 0.9)' : 'rgba(13, 148, 136, 0.9)',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                />
                {news.isFeatured && (
                  <Chip
                    label={t('hot')}
                    size="small"
                    color="error"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={{ maxWidth: 900, mx: 'auto' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontFamily: 'Poppins',
                fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
              }}
            >
              {news.title}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                mb: 3,
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {news.author?.username?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  {t('by')} {news.author?.username || 'Anonymous'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {t('publishedOn')} {new Date(news.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: 1,
                mb: 4,
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant={isLiked ? 'contained' : 'outlined'}
                color="error"
                startIcon={<Favorite />}
                onClick={handleLike}
                sx={{ borderRadius: 2 }}
              >
                {news.likes?.length || 0} {t('likes')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Comment />}
                sx={{ borderRadius: 2 }}
              >
                {comments.length} {t('comments')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                sx={{ borderRadius: 2 }}
              >
                {news.views || 0} {t('views')}
              </Button>
              <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
                <IconButton onClick={() => handleShare('twitter')} color="primary">
                  <Twitter />
                </IconButton>
                <IconButton onClick={() => handleShare('facebook')} color="primary">
                  <Facebook />
                </IconButton>
                <IconButton onClick={() => handleShare('linkedin')} color="primary">
                  <LinkedIn />
                </IconButton>
                <IconButton onClick={() => handleShare('copy')}>
                  <Share />
                </IconButton>
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Typography
              variant="body1"
              sx={{
                fontSize: '1.125rem',
                lineHeight: 1.8,
                mb: 4,
                whiteSpace: 'pre-wrap',
              }}
            >
              {news.description}
            </Typography>

            {news.content && (
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.125rem',
                  lineHeight: 1.8,
                  mb: 4,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {news.content}
              </Typography>
            )}

            <Divider sx={{ my: 4 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                {t('comments')} ({comments.length})
              </Typography>

              {isAuthenticated && (
                <Box
                  component="form"
                  onSubmit={handleSubmitComment}
                  sx={{ mb: 4 }}
                >
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder={t('writeComment')}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!newComment.trim() || submittingComment}
                    >
                      {submittingComment ? <CircularProgress size={20} /> : t('postComment')}
                    </Button>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {comments.map((comment) => (
                  <Box key={comment._id} sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {comment.user?.username || 'User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {comment.content}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Container>

      {relatedNews.length > 0 && (
        <Box sx={{ bgcolor: 'background.paper', py: 4 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
              {t('relatedNews')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {relatedNews.map((item) => (
                <NewsCard key={item._id} news={item} />
              ))}
            </Box>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default NewsDetail;