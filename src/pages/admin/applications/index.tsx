import { useEffect, useState } from 'react';
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
  Button,
  Chip,
} from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';
import { getMenuItems } from '@/store/menuStore.tsx';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface TherapistApplication {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  experience: string;
  specialization: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export default function TherapistApplications() {
  const [applications, setApplications] = useState<TherapistApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetchWithAuth('/api/applications/list');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const response = await fetchWithAuth('/api/applications/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      // Refresh applications list after successful update
      await fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating application');
    }
  };

  const menuItems = getMenuItems('admin');

  if (loading) {
    return (
      <DashboardLayout title="Therapist Applications" menuItems={menuItems}>
        <Container maxWidth="lg">
          <Typography>Loading...</Typography>
        </Container>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Therapist Applications" menuItems={menuItems}>
        <Container maxWidth="lg">
          <Typography color="error">{error}</Typography>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Therapist Applications" menuItems={menuItems}>
      <Container maxWidth="lg">
        <Typography variant="h5" sx={{ mb: 4 }}>
          Therapist Applications
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.name}</TableCell>
                  <TableCell>{application.email}</TableCell>
                  <TableCell>{application.username}</TableCell>
                  <TableCell>{application.phone}</TableCell>
                  <TableCell>{application.experience}</TableCell>
                  <TableCell>{application.specialization}</TableCell>
                  <TableCell>
                    <Chip
                      label={application.status}
                      color={
                        application.status === 'approved'
                          ? 'success'
                          : application.status === 'rejected'
                          ? 'error'
                          : 'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {application.status === 'pending' && (
                      <>
                        <Button
                          size="small"
                          color="success"
                          onClick={() => handleStatusChange(application.id, 'approved')}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleStatusChange(application.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </DashboardLayout>
  );
}