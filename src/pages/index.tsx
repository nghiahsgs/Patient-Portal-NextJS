import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Box, Button, Typography, Paper } from '@mui/material';
import { useAuthStore } from '@/store/authStore';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';


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
            startIcon={<LoginIcon />}
            onClick={() => router.push('/login')}
            sx={{
              minWidth: '200px',
              py: 1.5,
              fontWeight: 600,
              transition: 'all 0.3s',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px -4px rgba(33, 150, 243, 0.4)',
              }
            }}
          >
              Sign In
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<PersonAddIcon />}
              onClick={() => router.push('/register')}
              sx={{
                minWidth: '200px',
                py: 1.5,
                fontWeight: 600,
                transition: 'all 0.3s',
                background: 'linear-gradient(45deg, #FF5722 30%, #FFA726 90%)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px -4px rgba(255, 87, 34, 0.4)',
                }
              }}
            >
              Register as Patient
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="info"
              size="large"
              startIcon={<LocalHospitalIcon />}
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