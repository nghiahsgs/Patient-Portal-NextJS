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

      // Get all stats in parallel for better performance
      const [
        totalPatients,
        totalTherapists,
        pendingApplications,
        totalAppointments,
        recentAppointments,
        appointmentStats,
        therapistStats
      ] = await Promise.all([
        // Total patients count
        prisma.patient.count(),

        // Total therapists count
        prisma.therapist.count(),

        // Pending therapist applications
        prisma.therapistApplication.count({
          where: { status: 'pending' }
        }),

        // Total appointments
        prisma.appointment.count(),

        // Recent appointments (last 7 days)
        prisma.appointment.findMany({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          },
          include: {
            patient: {
              include: { user: true }
            },
            therapist: {
              include: { user: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),

        // Appointment statistics by status
        prisma.appointment.groupBy({
          by: ['status'],
          _count: true
        }),

        // Therapist statistics by specialization
        prisma.therapist.groupBy({
          by: ['specialization'],
          _count: true
        })
      ]);

      return res.status(200).json({
        overview: {
          totalPatients,
          totalTherapists,
          pendingApplications,
          totalAppointments
        },
        recentActivity: {
          recentAppointments
        },
        analytics: {
          appointmentsByStatus: appointmentStats.reduce((acc, curr) => ({
            ...acc,
            [curr.status]: curr._count
          }), {}),
          therapistsBySpecialization: therapistStats.reduce((acc, curr) => ({
            ...acc,
            [curr.specialization]: curr._count
          }), {})
        }
      });
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}