import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, username, phone, experience, specialization, education } = req.body;

    // Convert experience to number and validate
    const experienceNum = parseInt(experience);
    if (isNaN(experienceNum)) {
      return res.status(400).json({ message: 'Experience must be a valid number' });
    }

    const application = await prisma.therapistApplication.create({
      data: {
        name,
        email,
        username,
        phone,
        experience: experienceNum, // Use converted number
        specialization,
        education,
        status: 'pending',
      }
    });

    return res.status(201).json(application);
  } catch (error) {
    console.error('Application error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}