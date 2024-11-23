import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';
import { zonedTimeToUtc } from 'date-fns-tz';
import { TIME_ZONE } from '@/utils/dateTime';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await authMiddleware(req, res, async () => {
      if (req.user?.role !== 'patient') {
        return res.status(403).json({ message: 'Only patients can book appointments' });
      }

      const { date, startTime, endTime, therapistId, notes } = req.body;

      if (!date || !startTime || !endTime || !therapistId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Get patient profile ID
      const patientProfile = await prisma.patient.findFirst({
        where: { userId: req.user.id }
      });

      if (!patientProfile) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }

      // Check if therapist exists
      const therapist = await prisma.therapist.findUnique({
        where: { id: therapistId }
      });

      if (!therapist) {
        return res.status(404).json({ message: 'Therapist not found' });
      }

      // Tạo date objects với timezone
      const [startHour, startMinute] = startTime.split(':');
      const [endHour, endMinute] = endTime.split(':');

      const userStartDateTime = new Date(date);
      userStartDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0);
      
      const userEndDateTime = new Date(date);
      userEndDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0);

      // Chuyển đổi sang UTC để lưu vào database
      const startDateTime = zonedTimeToUtc(userStartDateTime, TIME_ZONE);
      const endDateTime = zonedTimeToUtc(userEndDateTime, TIME_ZONE);
      const appointmentDate = zonedTimeToUtc(new Date(date), TIME_ZONE);

      // Check for time slot conflicts (using UTC time)
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          therapistId,
          date: appointmentDate,
          status: 'scheduled',
          OR: [
            {
              AND: [
                { startTime: { lte: startDateTime } },
                { endTime: { gt: startDateTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: endDateTime } },
                { endTime: { gte: endDateTime } }
              ]
            }
          ]
        }
      });

      if (conflictingAppointment) {
        return res.status(409).json({ message: 'Time slot is not available' });
      }

      // Create new appointment with UTC times
      const appointment = await prisma.appointment.create({
        data: {
          patientId: patientProfile.id,
          therapistId,
          date: appointmentDate,
          startTime: startDateTime,
          endTime: endDateTime,
          status: 'pending',
          notes,
        },
        include: {
          patient: {
            include: { user: true }
          },
          therapist: {
            include: { user: true }
          }
        }
      });

      return res.status(201).json(appointment);
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}