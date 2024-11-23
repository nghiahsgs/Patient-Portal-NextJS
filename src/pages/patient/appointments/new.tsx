import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { TimeSlot } from '@/types/appointment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import { format } from 'date-fns';
import { formatDate } from '@/utils/dateTime';
import { withAuth } from '@/components/withAuth';
import { getMenuItems } from '@/store/menuStore.tsx';
import { messageService } from '@/services/messageService';

export function NewAppointment() {
  const router = useRouter();
  const [date, setDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [therapist, setTherapist] = useState('');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [error, setError] = useState('');
  const [therapists, setTherapists] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/therapists/list', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch therapists');
        }
        const data = await response.json();
        setTherapists(data);
      } catch (err) {
        setError('Failed to fetch therapists');
      }
    };

    fetchTherapists();
  }, [user, router]);
  useEffect(() => {
    if (date && therapist) {
      fetchAvailableSlots();
    }
  }, [date, therapist]);

  const fetchAvailableSlots = async () => {
    if (!date || !therapist) return;
    
    try {
      const token = localStorage.getItem('token');
      // const formattedDate = formatDate(date);
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await fetch(`/api/therapists/available-slots?date=${formattedDate}&therapistId=${therapist}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }
      const data = await response.json();
      setAvailableSlots(data);
    } catch (err) {
      setError('Failed to fetch available slots');
    }
  };

  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);
    setSelectedSlot(''); // Reset selected slot when date changes
  };

  const handleTherapistChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newTherapist = event.target.value as string;
    setTherapist(newTherapist);
    setSelectedSlot(''); // Reset selected slot when therapist changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!date || !selectedSlot || !therapist) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const slot = availableSlots.find(s => s.id === selectedSlot);
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          date: formattedDate,
          startTime: slot?.startTime,
          endTime: slot?.endTime,
          therapistId: therapist,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Booking failed');
      }

      // Send message to therapist
      const selectedTherapist = therapists.find(t => t.id === therapist);
      const therapistUserId = selectedTherapist?.userId;
      const messageContent = `I would like to book an appointment on ${formattedDate} from ${slot?.startTime} to ${slot?.endTime}.`;
      await messageService.sendMessage(therapistUserId, messageContent);

            
      router.push('/patient/appointments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    }
  };

  const menuItems = getMenuItems('patient');
  return (
    <DashboardLayout title="Book New Appointment" menuItems={menuItems}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Therapist</InputLabel>
                  <Select
                    value={therapist}
                    onChange={handleTherapistChange}
                    label="Select Therapist"
                  >
                    {therapists.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Select Date"
                    value={date}
                    onChange={handleDateChange}
                    disablePast
                    sx={{ width: '100%' }}
                  />
                </LocalizationProvider>
              </Grid>
              {therapist && date && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Time Slot</InputLabel>
                    <Select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      label="Time Slot"
                    >
                      {availableSlots.map((slot) => (
                        <MenuItem
                          key={slot.id}
                          value={slot.id}
                          disabled={!slot.isAvailable}
                        >
                          {slot.startTime} - {slot.endTime}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={!date || !selectedSlot || !therapist}
                >
                  Book Appointment
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </DashboardLayout>
  );
}
export default withAuth(NewAppointment, { requiredRole: 'patient' });