import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await authMiddleware(req, res, async () => {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const conversations = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        orderBy: {
          timestamp: 'desc'
        },
        distinct: ['senderId', 'receiverId'],
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true
            }
          }
        }
      });

      const formattedConversations = conversations.map(msg => {
        const partner = msg.senderId === userId ? msg.receiver : msg.sender;
        
        if (
          (userRole === 'patient' && partner.role !== 'therapist') ||
          (userRole === 'therapist' && partner.role !== 'patient')
        ) {
          return null;
        }

        return {
          id: msg.id,
          partnerId: partner.id,
          partnerName: partner.name,
          lastMessage: msg.content,
          lastMessageTime: msg.timestamp
        };
      }).filter(Boolean);

      return res.status(200).json(formattedConversations);
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}