import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await authMiddleware(req, res, async () => {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const applications = await prisma.therapistApplication.findMany({
        orderBy: {
          submittedAt: 'desc'
        }
      });

      return res.status(200).json(applications);
    });
  } catch (error) {
    console.error('List applications error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}