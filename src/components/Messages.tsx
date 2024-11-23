import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Grid,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { getMenuItems } from '@/store/menuStore.tsx';
import { withAuth } from '@/components/withAuth';
import { messageService } from '@/services/messageService';


interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  partnerId: string;
  partnerName: string;
  lastMessage: string;
  lastMessageTime: string;
}



export function Messages() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    
  }, [user, router]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const data = await messageService.getConversations();
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          setIsLoadingMessages(true);
          const data = await messageService.getMessages(selectedConversation.partnerId);
          setMessages(data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          setIsLoadingMessages(false);
        }
      };

      fetchMessages();
    }
  }, [selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setIsSending(true);
      // Send the message
      const sentMessage = await messageService.sendMessage(
        selectedConversation.partnerId,
        newMessage.trim()
      );

      // Update messages list with the new message
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setNewMessage(''); // Clear input
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };


  
  
  return (
      <Container maxWidth="lg">
        <Grid container spacing={2} sx={{ height: 'calc(100vh - 150px)' }}>
          {/* Conversations List */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ height: '100%', overflow: 'auto' }}>
              <List>
                {isLoading ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <CircularProgress />
                  </Box>
                ) : conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <ListItem
                      button
                      key={conversation.id}
                      selected={selectedConversation?.id === conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <ListItemAvatar>
                        <Avatar>{conversation.partnerName[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={conversation.partnerName}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="textPrimary"
                            >
                              {conversation.lastMessage}
                            </Typography>
                            <br />
                            <Typography
                              component="span"
                              variant="caption"
                              color="textSecondary"
                            >
                              {new Date(conversation.lastMessageTime).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                      No conversations yet
                    </Typography>
                  </Box>
                )}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column' 
            }}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <Box sx={{ 
                    p: 2, 
                    borderBottom: 1, 
                    borderColor: 'divider'
                  }}>
                    <Typography variant="h6">
                      {selectedConversation.partnerName}
                    </Typography>
                  </Box>

                  {/* Messages Area */}
                  <Box sx={{ 
                    flexGrow: 1, 
                    overflow: 'auto', 
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    {isLoadingMessages ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      messages.map((message) => (
                        <Box
                          key={message.id}
                          sx={{
                            alignSelf: message.senderId === user?.id ? 'flex-end' : 'flex-start',
                            maxWidth: '70%'
                          }}
                        >
                          <Paper
                            sx={{
                              p: 1,
                              bgcolor: message.senderId === user?.id ? 'primary.main' : 'grey.100',
                              color: message.senderId === user?.id ? 'white' : 'text.primary'
                            }}
                          >
                            <Typography>{message.content}</Typography>
                            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </Typography>
                          </Paper>
                        </Box>
                      ))
                    )}
                  </Box>

                  {/* Message Input */}
                  <Box
                    component="form"
                    onSubmit={handleSendMessage}
                    sx={{
                      p: 2,
                      borderTop: 1,
                      borderColor: 'divider',
                      display: 'flex',
                      gap: 1
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isSending}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!newMessage.trim() || isSending}
                      endIcon={<SendIcon />}
                    >
                      Send
                    </Button>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography color="textSecondary">
                    Select a conversation to start messaging
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
  );
}