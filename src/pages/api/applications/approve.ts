import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await authMiddleware(req, res, async () => {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const { applicationId } = req.body;

      const application = await prisma.therapistApplication.findUnique({
        where: { id: applicationId }
      });

      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      // Create user and therapist profile in transaction
      const result = await prisma.$transaction(async (prisma) => {
        // Update application status
        await prisma.therapistApplication.update({
          where: { id: applicationId },
          data: { status: 'approved' }
        });

        // Create user account
        const user = await prisma.user.create({
          data: {
            username: application.username,
            email: application.email,
            password: bcrypt.hashSync('1234', 10), // Should be changed on first login
            name: application.name,
            role: 'therapist',
            therapistProfile: {
              create: {
                licenseNumber: `LIC${Date.now()}`, // Generate unique license number
                specialization: application.specialization,
                yearsOfExperience: application.experience,
                education: application.education,
                applicationStatus: "approved",
              }
            }
          }
        });

        return user;
      });

      return res.status(200).json({
        message: 'Application approved and therapist account created',
        user: result
      });
    });
  } catch (error) {
    console.error('Approve application error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}