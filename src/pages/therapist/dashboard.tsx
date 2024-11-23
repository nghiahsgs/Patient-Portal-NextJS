import { useRouter } from 'next/router';
import {
  Grid,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { withAuth } from '@/components/withAuth';
import { getMenuItems } from '@/store/menuStore.tsx';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';


export function TherapistDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);



  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetchWithAuth('/api/therapists/stats');
        const data = await response.json();
        setAppointments(data.todayAppointments);
        setTotalPatients(data.totalPatients);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
  
    if (user) {
      fetchDashboardData();
    }
  }, [user, router]);

  const menuItems = getMenuItems('therapist');
  return (
    <DashboardLayout title="Therapist Dashboard" menuItems={menuItems}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Today's Appointments
            </Typography>
            <Typography variant="h3">{appointments}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Total Patients
            </Typography>
            <Typography variant="h3">{totalPatients}</Typography>
          </Paper>
        </Grid>
        {/* <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Unread Messages
            </Typography>
            <Typography variant="h3">0</Typography>
          </Paper>
        </Grid> */}
      </Grid>
    </DashboardLayout>
  );
}
export default withAuth(TherapistDashboard, { requiredRole: 'therapist' });