import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Grid,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { withAuth } from '@/components/withAuth';
import { getMenuItems } from '@/store/menuStore.tsx';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface DashboardStats {
  overview: {
    totalPatients: number;
    totalTherapists: number;
    pendingApplications: number;
    totalAppointments: number;
  };
  recentActivity: {
    recentAppointments: any[];
  };
  analytics: {
    appointmentsByStatus: Record<string, number>;
    therapistsBySpecialization: Record<string, number>;
  };
}

export function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const menuItems = getMenuItems('admin');

  const fetchDashboardStats = async () => {
    try {
      const response = await fetchWithAuth('/api/admin/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  return (
    <DashboardLayout title="Admin Dashboard" menuItems={menuItems}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Total Patients
            </Typography>
            <Typography variant="h3">
              {stats?.overview.totalPatients || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Therapists
            </Typography>
            <Typography variant="h3">
              {stats?.overview.totalTherapists || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pending Applications
            </Typography>
            <Typography variant="h3">
              {stats?.overview.pendingApplications || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}

export default withAuth(AdminDashboard, { requiredRole: 'admin' });