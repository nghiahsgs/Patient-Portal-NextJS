import { Container, Typography, Box, Button } from '@mui/material';
import { useRouter } from 'next/router';

export default function ApplicationSuccess() {
  const router = useRouter();

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          Application Submitted Successfully!
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Thank you for applying to join our platform. We will review your application and contact you soon.
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/')}
          sx={{ mt: 4 }}
        >
          Return to Home
        </Button>
      </Box>
    </Container>
  );
}