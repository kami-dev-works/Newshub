import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../stores/ThemeContext';
import { DataProvider } from '../stores/DataContext';
import { LanguageProvider } from '../stores/LanguageContext';
import App from '../App';

const Root = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider>
          <DataProvider>
            <LanguageProvider>
              <App />
            </LanguageProvider>
          </DataProvider>
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

if (typeof window !== 'undefined') {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<Root />);
  }
}

export default Root;