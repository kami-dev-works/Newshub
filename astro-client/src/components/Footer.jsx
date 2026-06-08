import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Send,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useThemeContext } from '../stores/ThemeContext';
import { useData } from '../stores/DataContext';
import { useLanguage } from '../stores/LanguageContext';

const socialLinks = [
  { icon: <Facebook />, label: 'Facebook', color: '#1877F2', href: 'https://facebook.com' },
  { icon: <Twitter />, label: 'Twitter', color: '#1DA1F2', href: 'https://twitter.com' },
  { icon: <Instagram />, label: 'Instagram', color: '#E4405F', href: 'https://instagram.com' },
  { icon: <LinkedIn />, label: 'LinkedIn', color: '#0A66C2', href: 'https://linkedin.com' },
];

const quickLinks = [
  { labelKey: 'aboutUs', toast: 'About page coming soon!' },
  { labelKey: 'contact', toast: 'Contact page coming soon!' },
  { labelKey: 'privacyPolicy', toast: 'Privacy Policy page coming soon!' },
  { labelKey: 'termsOfService', toast: 'Terms page coming soon!' },
];

const footerCategories = [
  { labelKey: 'technology', value: 'technology' },
  { labelKey: 'business', value: 'business' },
  { labelKey: 'sports', value: 'sports' },
  { labelKey: 'entertainment', value: 'entertainment' },
  { labelKey: 'health', value: 'health' },
  { labelKey: 'science', value: 'science' },
];

const Footer = () => {
  const { isDark } = useThemeContext();
  const { showToast } = useData();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      showToast(t('successSubscribed'), 'success');
      setEmail('');
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        mt: 8,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: isDark
            ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(244, 63, 94, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(13, 148, 136, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
          pointerEvents: 'none',
        }}
      />
      
      <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontFamily: 'Poppins',
                color: 'primary.main',
                mb: 2,
              }}
            >
              NewsHub
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('allNews')} - {t('aboutUs')}. {t('enableLocationDesc')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socialLinks.map((social) => (
                <motion.div
                  key={social.label}
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconButton
                    component="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    sx={{
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: social.color,
                        color: '#fff',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {social.icon}
                  </IconButton>
                </motion.div>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {t('quickLinks')}
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {quickLinks.map((link) => (
                <Box component="li" key={link.labelKey} sx={{ mb: 1 }}>
                  <Typography
                    component="span"
                    onClick={() => showToast(link.toast, 'info')}
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {t(link.labelKey)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {t('categories')}
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {footerCategories.map((cat) => (
                <Box component="li" key={cat.value} sx={{ mb: 1 }}>
                  <Typography
                    component={Link}
                    to={`/?category=${cat.value}`}
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {t(cat.labelKey)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {t('newsletter')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('subscribeDesc')}
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubscribe}
              sx={{
                display: 'flex',
                gap: 1,
              }}
            >
              <TextField
                size="small"
                placeholder={t('yourEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                type="email"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  },
                }}
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ minWidth: 'auto', px: 2 }}
                  aria-label={t('subscribe')}
                >
                  <Send />
                </Button>
              </motion.div>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} NewsHub. {t('allRightsReserved')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography
              component={Link}
              to="/privacy"
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              {t('privacy')}
            </Typography>
            <Typography
              component={Link}
              to="/terms"
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              {t('terms')}
            </Typography>
            <Typography
              component={Link}
              to="/contact"
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              {t('contact')}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;