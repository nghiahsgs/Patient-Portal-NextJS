import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await authMiddleware(req, res, async () => {
      const therapists = await prisma.therapist.findMany({
        where: {
          applicationStatus: 'approved'
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          workingHours: true
        }
      });

      return res.status(200).json(therapists);
    });
  } catch (error) {
    console.error('List therapists error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}