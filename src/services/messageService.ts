import { fetchWithAuth } from '@/lib/fetchWithAuth';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    username: string;
  };
  receiver: {
    id: string;
    name: string;
    username: string;
  };
}
export interface Conversation {
    id: string;
    partnerId: string;
    partnerName: string;
    lastMessage: string;
    lastMessageTime: string;
}

export const messageService = {
  getMessages: async (partnerId: string): Promise<Message[]> => {
    const response = await fetchWithAuth(`/api/messages/list?partnerId=${partnerId}`);
    return response.json();
  },

  sendMessage: async (receiverId: string, content: string): Promise<Message> => {
    const response = await fetchWithAuth('/api/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ receiverId, content }),
    });
    return response.json();
  },
  getConversations: async (): Promise<Conversation[]> => {
    const response = await fetchWithAuth('/api/messages/conversations');
    return response.json();
  },
};