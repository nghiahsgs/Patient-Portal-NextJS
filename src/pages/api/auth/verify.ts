import { NextApiResponse } from 'next';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await authMiddleware(req, res, async () => {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      return res.status(200).json({ user });
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}