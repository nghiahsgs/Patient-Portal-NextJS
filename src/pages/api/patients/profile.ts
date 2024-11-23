import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    await authMiddleware(req, res, async () => {
      if (req.user?.role !== 'patient') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      if (req.method === 'GET') {
        const profile = await prisma.patient.findFirst({
          where: { userId: req.user.id },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                username: true
              }
            }
          }
        });
        return res.status(200).json(profile);
      }

      if (req.method === 'PUT') {
        const { phoneNumber, dateOfBirth, address, emergencyContact, medicalHistory } = req.body;

        const updatedProfile = await prisma.patient.update({
          where: { userId: req.user.id },
          data: {
            phoneNumber,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            address,
            emergencyContact,
            medicalHistory
          }
        });
        return res.status(200).json(updatedProfile);
      }

      return res.status(405).json({ message: 'Method not allowed' });
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}