import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeContextProvider');
  }
  return context;
};

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#0D9488' },
          secondary: { main: '#6366F1' },
          background: { default: '#F8FAFC', paper: '#FFFFFF' },
          text: { primary: '#1E293B', secondary: '#64748B' },
        }
      : {
          primary: { main: '#F43F5E' },
          secondary: { main: '#A855F7' },
          background: { default: '#0F0F1A', paper: '#1A1A2E' },
          text: { primary: '#F1F5F9', secondary: '#94A3B8' },
        }),
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    h3: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('theme-mode');
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => {
    return createTheme(getDesignTokens(mode));
  }, [mode]);

  const value = useMemo(() => ({
    mode,
    toggleTheme,
    isDark: mode === 'dark',
  }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};