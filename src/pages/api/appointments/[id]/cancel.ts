import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await authMiddleware(req, res, async () => {
      const appointmentId = req.query.id as string;
      const { reason } = req.body;

      // Check if appointment exists
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          therapist: true
        }
      });

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Check if user has permission to cancel
      if (req.user?.role === 'patient' && appointment.patient.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
      }

      if (req.user?.role === 'therapist' && appointment.therapist.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
      }

      if (appointment.status === 'cancelled' || appointment.status === 'completed') {
        return res.status(400).json({ 
          message: `Cannot cancel appointment that is already ${appointment.status}` 
        });
      }

      // Update appointment status
      const updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { 
          status: 'cancelled',
          notes: reason ? `${appointment.notes || ''}\nCancellation reason: ${reason}` : appointment.notes
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

      return res.status(200).json(updatedAppointment);
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}