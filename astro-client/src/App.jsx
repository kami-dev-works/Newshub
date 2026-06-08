import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ThemeProvider } from './stores/ThemeContext';
import { DataProvider } from './stores/DataContext';
import { LanguageProvider } from './stores/LanguageContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AllNews from './components/AllNews';
import Sidebar from './components/Sidebar';
import NewsSlider from './components/NewsSlider';
import NewsDetail from './components/NewsDetail';
import Login from './components/Login';
import Register from './components/Register';
import Submit from './components/Submit';
import Settings from './components/Settings';
import Admin from './components/Admin';
import LikedNews from './components/LikedNews';
import RecentNews from './components/RecentNews';
import LocalNews from './components/LocalNews';
import TopNews from './components/TopNews';
import TRP from './components/TRP';
import { useData } from './stores/DataContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useData();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const Layout = ({ 
  category, 
  setCategory, 
  sort, 
  setSort,
  showSlider = true,
  children 
}) => {
  const { isDark } = { isDark: false };
  const { toast, closeToast } = { toast: { open: false, message: '', severity: 'info' }, closeToast: () => {} };
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile] = useState(false);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        color: 'text.primary',
        transition: 'all 0.3s ease',
      }}
    >
      <Header />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pb: 4,
        }}
      >
        {showSlider && <NewsSlider />}

        {typeof category !== 'undefined' && typeof setCategory !== 'undefined' ? (
          <Box sx={{ 
            maxWidth: 1400, 
            mx: 'auto', 
            px: { xs: 2, sm: 3 },
            mt: 4,
          }}>
            {isMobile && (
              <Box sx={{ mb: 2 }}>
                Filters
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 3 }}>
              <Sidebar
                category={category}
                setCategory={setCategory}
                sort={sort}
                setSort={setSort}
                showMobileFilters={showMobileFilters}
                setShowMobileFilters={setShowMobileFilters}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {children}
              </Box>
            </Box>
          </Box>
        ) : (
          children
        )}
      </Box>

      <Footer />
    </Box>
  );
};

const AppContent = () => {
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('-createdAt');

  return (
    <Routes>
      <Route path="/" element={
        <Layout
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          showSlider={true}
        >
          <AllNews 
            category={category} 
            setCategory={setCategory} 
            sort={sort} 
            setSort={setSort} 
          />
        </Layout>
      } />
      
      <Route path="/news/:slug" element={
        <Layout showSlider={false}>
          <NewsDetail />
        </Layout>
      } />
      
      <Route path="/top-news" element={
        <Layout
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          showSlider={true}
        >
          <TopNews 
            category={category} 
            setCategory={setCategory} 
            sort={sort} 
            setSort={setSort} 
          />
        </Layout>
      } />
      
      <Route path="/liked" element={
        <ProtectedRoute>
          <Layout
            category={category}
            setCategory={setCategory}
            sort={sort}
            setSort={setSort}
            showSlider={true}
          >
            <LikedNews 
              category={category} 
              setCategory={setCategory} 
              sort={sort} 
              setSort={setSort} 
            />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/recent" element={
        <Layout
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          showSlider={true}
        >
          <RecentNews 
            category={category} 
            setCategory={setCategory} 
            sort={sort} 
            setSort={setSort} 
          />
        </Layout>
      } />
      
      <Route path="/local" element={
        <Layout
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          showSlider={true}
        >
          <LocalNews 
            category={category} 
            setCategory={setCategory} 
            sort={sort} 
            setSort={setSort} 
          />
        </Layout>
      } />
      
      <Route path="/submit" element={
        <ProtectedRoute>
          <Layout showSlider={false}>
            <Submit />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout showSlider={false}>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <Layout showSlider={false}>
            <Admin />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/trp" element={
        <Layout showSlider={false}>
          <TRP />
        </Layout>
      } />
      
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <DataProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </DataProvider>
    </ThemeProvider>
  );
};

export default App;