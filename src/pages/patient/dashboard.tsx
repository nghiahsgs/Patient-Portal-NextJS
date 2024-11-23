import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Box,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { Appointment } from '@/types/appointment';
import { formatDate, formatTimeRange } from '@/utils/dateTime';
import { withAuth } from '@/components/withAuth';
import { getMenuItems } from '@/store/menuStore.tsx';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export function PatientDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const appointmentsRes = await fetchWithAuth('/api/appointments/list');
    
        if (!appointmentsRes.ok) {
          throw new Error('Failed to fetch appointments');
        }
    
        const appointments = await appointmentsRes.json();
        
        // Filter for upcoming appointments
        const upcoming = appointments.filter((apt: Appointment) => 
          new Date(apt.date) >= new Date() && apt.status === 'scheduled'
        );
        
        setUpcomingAppointments(upcoming);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [user, router]);

  const menuItems = getMenuItems('patient');

  return (
    <DashboardLayout title="Patient Dashboard" menuItems={menuItems}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Appointments
            </Typography>
            <Box sx={{ mt: 2 }}>
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <Box key={appointment.id} sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                      {formatDate(appointment.date)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      At: {formatTimeRange(appointment.startTime, appointment.endTime)}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      mt: 0.5,
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1 
                    }}>
                      <PersonIcon sx={{ fontSize: 18 }} />
                      Doctor: {appointment.therapist.user.name}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body1">No upcoming appointments</Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => router.push('/patient/appointments/new')}
              >
                Book New Appointment
              </Button>
            </Box>
          </Paper>
        </Grid>
        {/* <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Messages
            </Typography>
            <Typography variant="body1">No new messages</Typography>
          </Paper>
        </Grid> */}
      </Grid>
    </DashboardLayout>
  );
}
export default withAuth(PatientDashboard, { requiredRole: 'patient' });