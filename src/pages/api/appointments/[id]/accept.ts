import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await authMiddleware(req, res, async () => {
      if (req.user?.role !== 'therapist') {
        return res.status(403).json({ message: 'Only therapists can approve appointments' });
      }

      const appointmentId = req.query.id as string;

      // Check if appointment exists and belongs to this therapist
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          therapist: {
            userId: req.user.id
          }
        }
      });

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      if (appointment.status !== 'pending') {
        return res.status(400).json({ message: 'Can only approve pending appointments' });
      }

      // Update appointment status
      const updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'scheduled' },
        include: {
          patient: {
            include: { user: true }
          },
          therapist: {
            include: { user: true }
          }
        }
      });

      return res.status(200).json(updatedAppointment);
    });
  } catch (error) {
    console.error('Approve appointment error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}