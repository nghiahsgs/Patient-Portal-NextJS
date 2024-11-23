import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { theme } from '@/styles/theme';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export default function App({ Component, pageProps }: AppProps) {
  const login = useAuthStore((state) => state.login);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetchWithAuth('/api/auth/verify');
          
          if (response.ok) {
            const data = await response.json();
            login(data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth error:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [login, setLoading]);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </LocalizationProvider>
    </ThemeProvider>
  );
}