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

      const { role } = req.query;
      
      const users = await prisma.user.findMany({
        where: role ? { role: role as string } : undefined,
        include: {
          patientProfile: role === 'patient',
          therapistProfile: role === 'therapist'
        }
      });

      return res.status(200).json(users);
    });
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}