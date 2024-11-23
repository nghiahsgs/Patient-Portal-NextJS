import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await authMiddleware(req, res, async () => {
      const { partnerId } = req.query;
      const userId = req.user?.id;

      if (!partnerId) {
        return res.status(400).json({ message: 'Partner ID is required' });
      }

      // Lấy tin nhắn 2 chiều giữa 2 người
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            // Tin nhắn từ user hiện tại đến partner
            { AND: [{ senderId: userId }, { receiverId: partnerId as string }] },
            // Tin nhắn từ partner đến user hiện tại
            { AND: [{ senderId: partnerId as string }, { receiverId: userId }] }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              username: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        },
        orderBy: {
          timestamp: 'asc'
        }
      });

      return res.status(200).json(messages);
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}