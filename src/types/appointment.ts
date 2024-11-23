export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}
export interface User {
  id: string;
  name: string;
  userName: string;
  email: string;
}
export interface Patient {
  id: string;
  user: User;
}
export interface Therapist {
  id: string;
  user: User;
}
export interface Appointment {
  id: string;
  patientId: string;
  patient: Patient;
  therapistId: string;
  therapist: Therapist;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}