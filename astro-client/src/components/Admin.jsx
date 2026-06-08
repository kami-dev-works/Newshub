import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Pagination,
} from '@mui/material';
import { Dashboard, People, Article, Delete, Edit, Add, TrendingUp, Visibility, Check, Close, Pending, LockReset, LocalOffer, Campaign } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useThemeContext } from '../stores/ThemeContext';
import { useData } from '../stores/DataContext';
import { userApi, newsApi, adsApi } from '../lib/api';
import NewsImageUpload from './NewsImageUpload';

const categories = [
  { value: 'politics', label: 'Politics' },
  { value: 'sports', label: 'Sports' },
  { value: 'technology', label: 'Technology' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'local', label: 'Local' },
  { value: 'business', label: 'Business' },
  { value: 'health', label: 'Health' },
  { value: 'science', label: 'Science' },
];

const Admin = () => {
  const { isDark } = useThemeContext();
  const { isAdmin, isAuthenticated, showToast } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [news, setNews] = useState([]);
  const [pendingNews, setPendingNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsDialog, setNewsDialog] = useState({ open: false, news: null });
  const [resetPasswordDialog, setResetPasswordDialog] = useState({ open: false, user: null });
  const [newPassword, setNewPassword] = useState('');
  const [newsForm, setNewsForm] = useState({ title: '', description: '', content: '', image: '', category: 'technology', tags: '', isFeatured: false, views: 0, likes: 0 });
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [newsPage, setNewsPage] = useState(1);
  const [newsTotalPages, setNewsTotalPages] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [ads, setAds] = useState([]);
  const [adPage, setAdPage] = useState(1);
  const [adTotalPages, setAdTotalPages] = useState(1);
  const [adDialog, setAdDialog] = useState({ open: false });
  const [adForm, setAdForm] = useState({ title: '', description: '', image: '', redirectLink: '' });

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    else if (!isAdmin) navigate('/');
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) { fetchStats(); fetchUsers(); fetchAllNews(); fetchPendingNews(); fetchAds(); }
  }, [isAdmin]);

  const fetchStats = async () => {
    try { const response = await userApi.getStats(); setStats(response.data); } catch (err) { console.error('Failed to fetch stats:', err); }
  };

  const fetchUsers = async (page = 1) => {
    try { const response = await userApi.getAll({ page, limit: 10 }); setUsers(response.data.users); setUserTotalPages(response.data.pagination?.pages || 1); } catch (err) { console.error('Failed to fetch users:', err); }
  };

  const fetchAllNews = async (page = 1) => {
    try { const response = await newsApi.getAll({ page, limit: 10 }); setNews(response.data.news); setNewsTotalPages(response.data.pagination?.pages || 1); } catch (err) { console.error('Failed to fetch news:', err); } finally { setLoading(false); }
  };

  const fetchPendingNews = async (page = 1) => {
    try { const response = await newsApi.getPending({ page, limit: 12 }); setPendingNews(response.data.news); setPendingTotalPages(response.data.pagination?.pages || 1); } catch (err) { console.error('Failed to fetch pending news:', err); }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try { await userApi.deleteUser(userId); setUsers(users.filter(u => u._id !== userId)); showToast('User deleted', 'success'); } catch (err) { showToast('Failed to delete user', 'error'); }
    }
  };

  const handleDeleteNews = async (newsId) => {
    if (window.confirm('Delete this news?')) {
      try { await newsApi.delete(newsId); setNews(news.filter(n => n._id !== newsId)); showToast('News deleted', 'success'); } catch (err) { showToast('Failed to delete news', 'error'); }
    }
  };

  const handleApproveNews = async (newsId) => {
    try { await newsApi.approve(newsId); setPendingNews(pendingNews.filter(n => n._id !== newsId)); showToast('News approved', 'success'); fetchAllNews(); } catch (err) { showToast('Failed to approve', 'error'); }
  };

  const handleRejectNews = async (newsId) => {
    if (window.confirm('Reject this news?')) {
      try { await newsApi.reject(newsId); setPendingNews(pendingNews.filter(n => n._id !== newsId)); showToast('News rejected', 'info'); } catch (err) { showToast('Failed to reject', 'error'); }
    }
  };

  const handleOpenNewsDialog = (newsItem = null) => {
    if (newsItem) {
      setNewsForm({ title: newsItem.title, description: newsItem.description, content: newsItem.content, image: newsItem.image || '', category: newsItem.category, tags: newsItem.tags?.join(', ') || '', isFeatured: newsItem.isFeatured || false, views: newsItem.views || 0, likes: newsItem.likes?.length || 0 });
    } else {
      setNewsForm({ title: '', description: '', content: '', image: '', category: 'technology', tags: '', isFeatured: false, views: 0, likes: 0 });
    }
    setNewsDialog({ open: true, news: newsItem });
  };

  const handleSaveNews = async () => {
    try {
      const data = { title: newsForm.title, description: newsForm.description, content: newsForm.content, image: newsForm.image, category: newsForm.category, tags: newsForm.tags.split(',').map(t => t.trim()).filter(Boolean), isFeatured: newsForm.isFeatured };
      if (newsDialog.news) {
        await newsApi.update(newsDialog.news._id, data);
        await newsApi.updateStats(newsDialog.news._id, { views: newsForm.views, likes: Array(newsForm.likes).fill(null) });
        showToast('News updated', 'success');
      } else { await newsApi.create(data); showToast('News created', 'success'); }
      setNewsDialog({ open: false, news: null }); fetchAllNews();
    } catch (err) { showToast('Failed to save', 'error'); }
  };

  const fetchAds = async () => {
    try { const response = await adsApi.getAllAdmin(); setAds(response.data); setAdTotalPages(Math.ceil(response.data.length / 10) || 1); } catch (err) { console.error('Failed to fetch ads:', err); }
  };

  const handleOpenAdDialog = () => {
    setAdForm({ title: '', description: '', image: '', redirectLink: '' });
    setAdDialog({ open: true });
  };

  const handleSaveAd = async () => {
    try {
      await adsApi.create(adForm);
      showToast('Advertisement created', 'success');
      setAdDialog({ open: false });
      fetchAds();
    } catch (err) { showToast('Failed to create ad', 'error'); }
  };

  const handleDeleteAd = async (adId) => {
    if (window.confirm('Delete this advertisement?')) {
      try { await adsApi.delete(adId); setAds(ads.filter(a => a._id !== adId)); showToast('Ad deleted', 'success'); } catch (err) { showToast('Failed to delete ad', 'error'); }
    }
  };

  const handleUserPageChange = (e, v) => { setUserPage(v); fetchUsers(v); };
  const handleNewsPageChange = (e, v) => { setNewsPage(v); fetchAllNews(v); };
  const handlePendingPageChange = (e, v) => { setPendingPage(v); fetchPendingNews(v); };
  const handleAdPageChange = (e, v) => setAdPage(v);

  const paginatedAds = ads.slice((adPage - 1) * 10, adPage * 10);

  if (!isAdmin) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Poppins', background: isDark ? 'linear-gradient(135deg, #F43F5E, #A855F7)' : 'linear-gradient(135deg, #0D9488, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Dashboard</Typography>
        <Typography variant="body1" color="text.secondary">Manage users, content, and view analytics</Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<Dashboard />} label="Dashboard" />
          <Tab icon={<Pending />} label={`Pending (${pendingNews.length})`} />
          <Tab icon={<People />} label="Users" />
          <Tab icon={<Article />} label="News" />
        </Tabs>
      </Paper>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 3, textAlign: 'center', bgcolor: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(99, 102, 241, 0.1)' }}><Person sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} /><Typography variant="h3" sx={{ fontWeight: 700 }}>{stats?.totalUsers || 0}</Typography><Typography color="text.secondary">Total Users</Typography></Paper></Grid>
          <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 3, textAlign: 'center', bgcolor: isDark ? 'rgba(244, 63, 94, 0.1)' : 'rgba(13, 148, 136, 0.1)' }}><Article sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} /><Typography variant="h3" sx={{ fontWeight: 700 }}>{stats?.totalNews || 0}</Typography><Typography color="text.secondary">Total News</Typography></Paper></Grid>
          <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 3, textAlign: 'center', bgcolor: isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(14, 165, 233, 0.1)' }}><Visibility sx={{ fontSize: 40, color: 'info.main', mb: 1 }} /><Typography variant="h3" sx={{ fontWeight: 700 }}>{stats?.totalViews?.toLocaleString() || 0}</Typography><Typography color="text.secondary">Total Views</Typography></Paper></Grid>
          <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 3, textAlign: 'center', bgcolor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)' }}><TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} /><Typography variant="h3" sx={{ fontWeight: 700 }}>{stats?.trendingNews?.length || 0}</Typography><Typography color="text.secondary">Trending</Typography></Paper></Grid>
        </Grid>
        <Paper sx={{ p: 3 }}><Typography variant="h6" gutterBottom>Trending Posts</Typography>
          <TableContainer><Table><TableHead><TableRow><TableCell>Title</TableCell><TableCell>Author</TableCell><TableCell align="right">Views</TableCell><TableCell align="right">Likes</TableCell></TableRow></TableHead><TableBody>{stats?.trendingNews?.map((item) => (<TableRow key={item._id}><TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</TableCell><TableCell>{item.author?.username || 'Unknown'}</TableCell><TableCell align="right">{item.views}</TableCell><TableCell align="right">{item.likes?.length || 0}</TableCell></TableRow>))}</TableBody></Table></TableContainer>
        </Paper>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Typography variant="h6" gutterBottom>Pending Submissions</Typography>
        {pendingNews.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}><Check sx={{ fontSize: 64, color: 'success.main', mb: 2 }} /><Typography variant="h6" color="text.secondary">No pending submissions</Typography></Paper>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {pendingNews.map((item) => (
                <Grid item xs={12} md={6} key={item._id}>
                  <Card><CardMedia component="img" height="160" image={item.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800'} alt={item.title} /><CardContent><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Chip label={item.category} size="small" /><Typography variant="caption">{new Date(item.createdAt).toLocaleDateString()}</Typography></Box><Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{item.title}</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{item.description}</Typography><Box sx={{ display: 'flex', gap: 1 }}><Button variant="contained" color="success" startIcon={<Check />} onClick={() => handleApproveNews(item._id)} fullWidth>Approve</Button><Button variant="outlined" color="error" startIcon={<Close />} onClick={() => handleRejectNews(item._id)} fullWidth>Reject</Button></Box></CardContent></Card>
                </Grid>
              ))}
            </Grid>
            {pendingTotalPages > 1 && <Box sx={{ display: 'flex', justifyContent: 'center' }}><Pagination count={pendingTotalPages} page={pendingPage} onChange={handlePendingPageChange} color="primary" size="large" showFirstButton showLastButton /></Box>}
          </>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Paper sx={{ mb: 2 }}><Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}><Typography variant="h6">User Management</Typography></Box>
          <TableContainer><Table><TableHead><TableRow><TableCell>User</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell>Joined</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>{users.map((user) => (<TableRow key={user._id}><TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Avatar sx={{ bgcolor: 'primary.main' }}>{user.username?.charAt(0).toUpperCase()}</Avatar><Typography>{user.username}</Typography></Box></TableCell><TableCell>{user.email}</TableCell><TableCell><Chip label={user.role} color={user.role === 'admin' ? 'secondary' : 'default'} size="small" /></TableCell><TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell><TableCell align="right"><IconButton color="error" onClick={() => handleDeleteUser(user._id)} disabled={user.role === 'admin'}><Delete /></IconButton></TableCell></TableRow>))}</TableBody></Table></TableContainer>
        </Paper>
        {userTotalPages > 1 && <Box sx={{ display: 'flex', justifyContent: 'center' }}><Pagination count={userTotalPages} page={userPage} onChange={handleUserPageChange} color="primary" size="large" showFirstButton showLastButton /></Box>}
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenNewsDialog()}>Add News</Button>
          <Button variant="contained" color="secondary" startIcon={<LocalOffer />} onClick={handleOpenAdDialog}>Add Advertisement</Button>
        </Box>
        <Paper sx={{ mb: 3 }}><TableContainer><Table><TableHead><TableRow><TableCell>Title</TableCell><TableCell>Category</TableCell><TableCell>Author</TableCell><TableCell align="right">Views</TableCell><TableCell align="right">Likes</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>{news.map((item) => (<TableRow key={item._id}><TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</TableCell><TableCell><Chip label={item.category} size="small" /></TableCell><TableCell>{item.author?.username || 'Unknown'}</TableCell><TableCell align="right">{item.views}</TableCell><TableCell align="right">{item.likes?.length || 0}</TableCell><TableCell align="right"><IconButton onClick={() => handleOpenNewsDialog(item)}><Edit /></IconButton><IconButton color="error" onClick={() => handleDeleteNews(item._id)}><Delete /></IconButton></TableCell></TableRow>))}</TableBody></Table></TableContainer></Paper>
        {newsTotalPages > 1 && <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}><Pagination count={newsTotalPages} page={newsPage} onChange={handleNewsPageChange} color="primary" size="large" showFirstButton showLastButton /></Box>}
        <Typography variant="h6" gutterBottom>Advertisements ({ads.length})</Typography>
        <Paper sx={{ mb: 2 }}><TableContainer><Table><TableHead><TableRow><TableCell>Image</TableCell><TableCell>Title</TableCell><TableCell>Redirect Link</TableCell><TableCell align="right">Clicks</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead><TableBody>{paginatedAds.map((ad) => (<TableRow key={ad._id}><TableCell><Box component="img" src={ad.image} sx={{ width: 80, height: 48, objectFit: 'cover', borderRadius: 1 }} /></TableCell><TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.title}</TableCell><TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.redirectLink}</TableCell><TableCell align="right"><Typography sx={{ fontWeight: 700, color: 'primary.main' }}>{ad.clicks || 0}</Typography></TableCell><TableCell align="right"><IconButton color="error" onClick={() => handleDeleteAd(ad._id)}><Delete /></IconButton></TableCell></TableRow>))}</TableBody></Table></TableContainer></Paper>
        {adTotalPages > 1 && <Box sx={{ display: 'flex', justifyContent: 'center' }}><Pagination count={adTotalPages} page={adPage} onChange={handleAdPageChange} color="primary" size="large" showFirstButton showLastButton /></Box>}
      </TabPanel>

      <Dialog open={newsDialog.open} onClose={() => setNewsDialog({ open: false, news: null })} maxWidth="md" fullWidth>
        <DialogTitle>{newsDialog.news ? 'Edit News' : 'Create New News'}</DialogTitle>
        <DialogContent><Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}><TextField label="Title" fullWidth value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} required /><TextField label="Description" fullWidth multiline rows={2} value={newsForm.description} onChange={(e) => setNewsForm({ ...newsForm, description: e.target.value })} /><TextField label="Content" fullWidth multiline rows={6} value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })} /><FormControl fullWidth><InputLabel>Category</InputLabel><Select value={newsForm.category} label="Category" onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}>{categories.map((cat) => (<MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>))}</Select></FormControl><TextField label="Tags (comma-separated)" fullWidth value={newsForm.tags} onChange={(e) => setNewsForm({ ...newsForm, tags: e.target.value })} /><NewsImageUpload onUploadComplete={(url) => setNewsForm({ ...newsForm, image: url })} label="Featured Image" /><Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><input type="checkbox" id="isFeatured" checked={newsForm.isFeatured} onChange={(e) => setNewsForm({ ...newsForm, isFeatured: e.target.checked })} /><label htmlFor="isFeatured">Mark as Featured</label></Box></Box></DialogContent>
        <DialogActions><Button onClick={() => setNewsDialog({ open: false, news: null })}>Cancel</Button><Button onClick={handleSaveNews} variant="contained">Save</Button></DialogActions>
      </Dialog>

      <Dialog open={adDialog.open} onClose={() => setAdDialog({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Campaign color="secondary" />Create Advertisement</Box></DialogTitle>
        <DialogContent><Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Title" fullWidth value={adForm.title} onChange={(e) => setAdForm({ ...adForm, title: e.target.value })} required />
          <TextField label="Description" fullWidth multiline rows={2} value={adForm.description} onChange={(e) => setAdForm({ ...adForm, description: e.target.value })} />
          <TextField label="Redirect Link" fullWidth value={adForm.redirectLink} onChange={(e) => setAdForm({ ...adForm, redirectLink: e.target.value })} required placeholder="https://example.com" />
          <NewsImageUpload onUploadComplete={(url) => setAdForm({ ...adForm, image: url })} label="Advertisement Image" />
        </Box></DialogContent>
        <DialogActions><Button onClick={() => setAdDialog({ open: false })}>Cancel</Button><Button onClick={handleSaveAd} variant="contained" color="secondary">Create Ad</Button></DialogActions>
      </Dialog>

      <Dialog open={resetPasswordDialog.open} onClose={() => setResetPasswordDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
        <DialogTitle><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LockReset color="warning" />Reset Password</Box></DialogTitle>
        <DialogContent><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Set a new password for: <strong>{resetPasswordDialog.user?.username}</strong></Typography><TextField fullWidth label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></DialogContent>
        <DialogActions><Button onClick={() => setResetPasswordDialog({ open: false, user: null })}>Cancel</Button><Button onClick={async () => { if (newPassword.length >= 6 && resetPasswordDialog.user) { await userApi.resetPassword(resetPasswordDialog.user._id, newPassword); showToast('Password reset', 'success'); setResetPasswordDialog({ open: false, user: null }); } }} variant="contained" color="warning">Reset</Button></DialogActions>
      </Dialog>
    </Container>
  );
};

function TabPanel({ children, value, index }) {
  return <div role="tabpanel" hidden={value !== index}>{value === index && <Box>{children}</Box>}</div>;
}

const Person = ({ sx }) => <Typography sx={{ fontSize: sx?.fontSize || 40 }}>👤</Typography>;

export default Admin;