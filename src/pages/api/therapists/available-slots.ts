import { NextApiRequest, NextApiResponse } from 'next';
import { TimeSlot } from '@/types/appointment';
import { prisma } from '@/lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

const generateTimeSlots = async (date: string, therapistId: string): Promise<TimeSlot[]> => {
  // Get therapist's working hours
  const workingHours = await prisma.workingHours.findFirst({
    where: { therapistId }
  });

  if (!workingHours) {
    return [];
  }

  const startHour = parseInt(workingHours.startHour.split(':')[0]);
  const endHour = parseInt(workingHours.endHour.split(':')[0]);

  // Create base slots
  const slots: TimeSlot[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push({
      id: `${date}-${hour}`,
      startTime: `${hour}:00`,
      endTime: `${hour + 1}:00`,
      isAvailable: true
    });
  }

  // Check if the date falls within working days
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const daysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const startDayIndex = daysOrder.indexOf(workingHours.startDayInWeek);
  const endDayIndex = daysOrder.indexOf(workingHours.endDayInWeek);
  const currentDayIndex = daysOrder.indexOf(dayOfWeek);

  // If not within working days, mark all slots as unavailable
  if (currentDayIndex < startDayIndex || currentDayIndex > endDayIndex) {
    return slots.map(slot => ({
      ...slot,
      isAvailable: false
    }));
  }

  // Get existing appointments and mark booked slots as unavailable
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      therapistId,
      date: dateObj,
      status: 'scheduled',
    }
  });

  return slots.map(slot => {
    const hour = parseInt(slot.startTime.split(':')[0]);
    const isBooked = existingAppointments.some(appointment => 
      appointment.startTime.getHours() === hour
    );
    return {
      ...slot,
      isAvailable: !isBooked
    };
  });
};

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await authMiddleware(req, res, async () => {
      const { date, therapistId } = req.query;

      if (!date) {
        return res.status(400).json({ message: 'Date is required' });
      }

      if (!therapistId) {
        return res.status(400).json({ message: 'Therapist ID is required' });
      }

      // Verify therapist exists
      const therapist = await prisma.therapist.findUnique({
        where: { id: therapistId as string }
      });

      if (!therapist) {
        return res.status(404).json({ message: 'Therapist not found' });
      }

      const availableSlots = await generateTimeSlots(date as string, therapistId as string);
      return res.status(200).json(availableSlots);
    });
  } catch (error) {
    console.error('Available slots error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}