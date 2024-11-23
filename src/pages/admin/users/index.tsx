import { useState } from 'react';
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
  IconButton,
  Button,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DashboardLayout from '@/components/DashboardLayout';
import { withAuth } from '@/components/withAuth';
import { getMenuItems } from '@/store/menuStore.tsx';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'therapist' | 'admin';
  status: 'active' | 'inactive';
  joinedDate: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'patient',
    status: 'active',
    joinedDate: '2023-11-01',
  },
  {
    id: '2',
    name: 'Dr. Jane Smith',
    email: 'jane@example.com',
    role: 'therapist',
    status: 'active',
    joinedDate: '2023-10-15',
  },
];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };
  const menuItems = getMenuItems('admin');

  return (
    <DashboardLayout title="User Management" menuItems={menuItems}>
      <Container maxWidth="lg">
        <Typography variant="h5" sx={{ mb: 4 }}>
          User Management
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={
                        user.role === 'admin'
                          ? 'error'
                          : user.role === 'therapist'
                          ? 'primary'
                          : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={user.status === 'active' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.joinedDate}</TableCell>
                  <TableCell>
                    <IconButton
                      color={user.status === 'active' ? 'error' : 'success'}
                      onClick={() => toggleUserStatus(user.id)}
                      size="small"
                    >
                      {user.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
                    </IconButton>
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
export default withAuth(UserManagement, { requiredRole: 'admin' });