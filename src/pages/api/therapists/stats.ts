import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await authMiddleware(req, res, async () => {
      if (req.user?.role !== 'therapist') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const therapist = await prisma.therapist.findFirst({
        where: { userId: req.user.id }
      });

      if (!therapist) {
        return res.status(404).json({ message: 'Therapist profile not found' });
      }

      // Get today's appointments count
      const todayAppointments = await prisma.appointment.count({
        where: {
          therapistId: therapist.id,
          date: {
            equals: new Date(new Date().setHours(0, 0, 0, 0))
          },
          status: 'scheduled'
        }
      });

      // Get total unique patients count
      const uniquePatients = await prisma.appointment.findMany({
        where: {
          therapistId: therapist.id,
          status: {
            in: ['completed', 'scheduled']
          }
        },
        select: {
          patientId: true
        },
        distinct: ['patientId']
      });

      return res.status(200).json({
        todayAppointments,
        totalPatients: uniquePatients.length
      });
    });
  } catch (error) {
    console.error('Get therapist stats error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}