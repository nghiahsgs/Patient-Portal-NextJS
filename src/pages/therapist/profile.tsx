import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Avatar,
  Chip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { withAuth } from '@/components/withAuth';
import { getMenuItems } from '@/store/menuStore.tsx';

interface TherapistProfile {
  id: string;
  userId: string;
  about: string;
  languages: string[];
  specialization: string;
  education: string;
  user: {
    name: string;
    email: string;
    username: string;
  };
  workingHours?: {
    startHour: string;
    endHour: string;
    startDayInWeek: string;
    endDayInWeek: string;
  };
}

export function TherapistProfile() {
  const router = useRouter();
  const { user  } = useAuthStore();
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/therapists/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          console.error('Failed to fetch profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, router]);

  const menuItems = getMenuItems('therapist');

  if (!profile) {
    return (
      <DashboardLayout title="My Profile" menuItems={menuItems}>
        <Container maxWidth="md">
          <Typography>Profile not found</Typography>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile" menuItems={menuItems}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Profile Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mr: 3,
                bgcolor: 'primary.main',
                fontSize: '2.5rem',
              }}
            >
              {profile.user.name?.[0] || 'T'}
            </Avatar>
            <Box>
              <Typography variant="h5" gutterBottom>
                {profile.user.name}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {profile.specialization}
              </Typography>
              <Box sx={{ mt: 1 }}>
                {profile.languages?.map((lang) => (
                  <Chip
                    key={lang}
                    label={lang}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {/* About Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              About
            </Typography>
            <Typography color="textSecondary" paragraph>
              {profile.about}
            </Typography>
          </Box>

          {/* Professional Details */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                Specialization
              </Typography>
              <Typography color="textSecondary" paragraph>
                {profile.specialization}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold">
                Education
              </Typography>
              <Typography color="textSecondary" paragraph>
                {profile.education}
              </Typography>
            </Grid>
            {profile.workingHours && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Working Hours
                </Typography>
                <Typography color="textSecondary" paragraph>
                  {`${profile.workingHours.startDayInWeek} to ${profile.workingHours.endDayInWeek}, ${profile.workingHours.startHour} - ${profile.workingHours.endHour}`}
                </Typography>
              </Grid>
            )}
          </Grid>

          {/* Contact Information */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Email
                </Typography>
                <Typography color="textSecondary">
                  {profile.user.email}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </DashboardLayout>
  );
}
export default withAuth(TherapistProfile, { requiredRole: 'therapist' });