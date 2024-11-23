import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { withAuth } from '@/components/withAuth';

export default function TherapistApplication() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    experience: '',
    specialization: '',
    education: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Application submission failed');
      }
  
      router.push('/application-success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Application submission failed');
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Therapist Application
          </Typography>
          <Typography color="textSecondary" align="center" paragraph>
            Join our platform as a professional therapist
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="experience"
              label="Years of Experience"
              type="number"
              value={formData.experience}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="specialization"
              label="Specialization"
              value={formData.specialization}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="education"
              label="Education Background"
              value={formData.education}
              onChange={handleChange}
            />
            {/* <TextField
              margin="normal"
              required
              fullWidth
              name="message"
              label="Why do you want to join our platform?"
              multiline
              rows={4}
              value={formData.message}
              onChange={handleChange}
            /> */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Submit Application
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}