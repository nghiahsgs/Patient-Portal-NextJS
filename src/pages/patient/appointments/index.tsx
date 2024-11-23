import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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



export function AppointmentList() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetchWithAuth('/api/appointments/list');
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchAppointments();
  }, [user, router]);

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

  const menuItems = getMenuItems('patient');
  return (
    <DashboardLayout title="My Appointments" menuItems={menuItems}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">My Appointments</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/patient/appointments/new')}
          >
            Book New Appointment
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Therapist</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
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
                    {appointment.therapist.user.name}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status}
                      color={getStatusColor(appointment.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{appointment.notes}</TableCell>
                </TableRow>
              ))}
              {appointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
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
export default withAuth(AppointmentList, { requiredRole: 'patient' });