import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import DashboardLayout from '@/components/DashboardLayout';
import { Appointment } from '@/types/appointment';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { formatDate, formatTimeRange } from '@/utils/dateTime';
import { withAuth } from '@/components/withAuth';
import { getMenuItems } from '@/store/menuStore.tsx';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export function TherapistAppointments() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetchWithAuth('/api/appointments/list');
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAppointments();
  }, [user, router]);

  const handleStatusChange = async (appointmentId: string, newStatus: 'accepted' | 'completed' | 'cancelled') => {
    try {
      const dict_status = {
        accepted: 'accept',
        completed: 'complete',
        cancelled: 'cancel',
      }
      const token = localStorage.getItem('token');
      const endpoint = `/api/appointments/${appointmentId}/${dict_status[newStatus]}`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${newStatus} appointment`);
      }

      // Update local state after successful API call
      setAppointments(appointments.map(apt =>
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      ));
    } catch (error) {
      console.error(`Error ${newStatus} appointment:`, error);
    }

    fetchAppointments();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const menuItems = getMenuItems('therapist');
  if (loading) {
    return (
      <DashboardLayout title="My Appointments" menuItems={menuItems}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Appointments" menuItems={menuItems}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5">Upcoming Appointments</Typography>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {formatDate(appointment.date)}
                  </TableCell>
                  <TableCell>
                    {formatTimeRange(appointment.startTime, appointment.endTime)}
                  </TableCell>
                  <TableCell>
                    {appointment.patient.user.name}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status}
                      color={getStatusColor(appointment.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{appointment.notes}</TableCell>
                  <TableCell>
                    {appointment.status === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleStatusChange(appointment.id, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </Box>
                    )}
                    {appointment.status === 'scheduled' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                        >
                          Complete
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {appointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No appointments found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </DashboardLayout>
  );
}
export default withAuth(TherapistAppointments, { requiredRole: 'therapist' });