import { ReactNode } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EventIcon from '@mui/icons-material/Event';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';


export interface MenuItem {
    icon: ReactNode;
    text: string;
    href: string;
}

interface MenuItems {
  admin: MenuItem[];
  patient: MenuItem[];
  therapist: MenuItem[];
}

export const menuItems: MenuItems = {
  admin: [
    {
      icon: <DashboardIcon />,
      text: 'Dashboard',
      href: '/admin/dashboard',
    },
    {
      icon: <PeopleIcon />,
      text: 'Users',
      href: '/admin/users',
    },
    {
      icon: <PersonAddIcon />,
      text: 'Applications',
      href: '/admin/applications',
    },
  ],
  
  patient: [
    {
      icon: <DashboardIcon />,
      text: 'Dashboard',
      href: '/patient/dashboard',
    },
    {
      icon: <EventIcon />,
      text: 'Appointments',
      href: '/patient/appointments',
    },
    {
      icon: <ChatIcon />,
      text: 'Messages',
      href: '/patient/messages',
    },
    {
      icon: <PersonIcon />,
      text: 'Profile',
      href: '/patient/profile',
    },
  ],

  therapist: [
    {
      icon: <DashboardIcon />,
      text: 'Dashboard',
      href: '/therapist/dashboard',
    },
    {
      icon: <EventIcon />,
      text: 'Appointments',
      href: '/therapist/appointments',
    },
    {
      icon: <ChatIcon />,
      text: 'Messages',
      href: '/therapist/messages',
    },
    {
      icon: <PersonIcon />,
      text: 'Profile',
      href: '/therapist/profile',
    },
  ],
};

export const getMenuItems = (role: 'admin' | 'patient' | 'therapist'): MenuItem[] => {
  return menuItems[role];
};