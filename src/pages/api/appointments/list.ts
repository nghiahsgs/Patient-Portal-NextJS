import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await authMiddleware(req, res, async () => {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      let appointments;
      if (userRole === 'patient') {
        appointments = await prisma.appointment.findMany({
          where: {
            patient: {
              userId: userId
            }
          },
          include: {
            therapist: {
              include: {
                user: true
              }
            }
          }
        });
      } else if (userRole === 'therapist') {
        appointments = await prisma.appointment.findMany({
          where: {
            therapist: {
              userId: userId
            }
          },
          include: {
            patient: {
              include: {
                user: true
              }
            }
          }
        });
      }

      return res.status(200).json(appointments);
    });
  } catch (error) {
    console.error('List appointments error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}