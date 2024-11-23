import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Box, Button, Typography, Paper } from '@mui/material';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'patient':
          router.push('/patient/dashboard');
          break;
        case 'therapist':
          router.push('/therapist/dashboard');
          break;
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to Therapy Portal
          </Typography>
          <Typography variant="h6" color="textSecondary" paragraph>
            Your trusted platform for mental health care and support
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => router.push('/register')}
            >
              Register as Patient
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="text"
              color="primary"
              onClick={() => router.push('/therapist/apply')}
            >
              Apply as Therapist
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}