import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    await authMiddleware(req, res, async () => {
      if (req.user?.role !== 'therapist') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      if (req.method === 'GET') {
        const profile = await prisma.therapist.findFirst({
          where: { userId: req.user.id },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                username: true
              }
            },
            workingHours: true
          }
        });
        return res.status(200).json(profile);
      }

      if (req.method === 'PUT') {
        const { about, languages, specialization, education, workingHours } = req.body;

        const updatedProfile = await prisma.$transaction(async (prisma) => {
          const therapist = await prisma.therapist.update({
            where: { userId: req.user.id },
            data: {
              about,
              languages,
              specialization,
              education
            }
          });

          if (workingHours) {
            await prisma.workingHours.upsert({
              where: { therapistId: therapist.id },
              create: {
                therapistId: therapist.id,
                ...workingHours
              },
              update: workingHours
            });
          }

          return therapist;
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