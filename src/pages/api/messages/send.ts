import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await authMiddleware(req, res, async () => {
      const { receiverId, content } = req.body;
      const senderId = req.user?.id;

      if (!receiverId || !content) {
        return res.status(400).json({ message: 'Receiver ID and content are required' });
      }

      // Kiểm tra receiver có tồn tại
      const receiver = await prisma.user.findUnique({
        where: { id: receiverId }
      });

      if (!receiver) {
        return res.status(404).json({ message: 'Receiver not found' });
      }

      // Tạo tin nhắn mới
      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          content
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
        }
      });

      return res.status(201).json(message);
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}