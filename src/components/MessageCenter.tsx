
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmergencyRequest, addMessageToRequest, getFirstAidTips } from '@/utils/mockData';
import { useAuth } from '@/context/AuthContext';
import { Send, Info, User, UserRound } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sendNotification } from '@/utils/notificationUtils';

interface MessageCenterProps {
  request: EmergencyRequest;
}

const MessageCenter: React.FC<MessageCenterProps> = ({ request }) => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(request.messages || []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTips, setShowTips] = useState(true);
  
  const firstAidTips = getFirstAidTips(request.emergencyType);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    
    // Set up real-time subscription for new messages
    if (request.id) {
      const messagesChannel = supabase
        .channel(`messages-${request.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `request_id=eq.${request.id}`
          },
          (payload) => {
            const newMessage = payload.new;
            
            // Add the new message to our local state
            setMessages(prev => [...prev, {
              id: newMessage.id,
              text: newMessage.content,
              sender: newMessage.sender_name,
              timestamp: newMessage.created_at
            }]);
            
            // Show notification if the message is not from the current user
            if (currentUser && newMessage.sender_id !== currentUser.id) {
              toast.info('New Message', {
                description: `${newMessage.sender_name}: ${newMessage.content}`
              });
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(messagesChannel);
      };
    }
  }, [request.id, currentUser]);

  // Use messages from state instead of request.messages
  useEffect(() => {
    // Initialize messages from request when component mounts or request changes
    setMessages(request.messages || []);
  }, [request.id, request.messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;
    
    // Determine sender name based on role
    const senderName = currentUser.role === 'driver' ? 
      `Driver ${currentUser.name}` : 
      request.userName;
    
    try {
      // Add message to local state first for immediate feedback
      const newMessage = {
        id: Date.now().toString(),
        text: message,
        sender: senderName,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Insert message into Supabase
      const { data, error } = await supabase
        .from('messages')
        .insert({
          request_id: request.id,
          content: message,
          sender_id: currentUser.id,
          sender_name: senderName
        })
        .select();
      
      if (error) throw error;
      
      // Send notification to the other party
      const recipientId = currentUser.role === 'driver' ? 
        request.userId : 
        request.assignedTo;
      
      if (recipientId) {
        await sendNotification(
          recipientId,
          'New Message',
          `${senderName}: ${message}`,
          'info'
        );
      }
      
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // Fallback to the mock API if Supabase fails
      addMessageToRequest(request.id, senderName, message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Communication Center</CardTitle>
            <CardDescription>
              {currentUser?.role === 'driver' ? 
                `Chat with ${request.userName}` : 
                request.driverName ? `Chat with ${request.driverName}` : 'Awaiting ambulance assignment'}
            </CardDescription>
          </div>
          {currentUser?.role === 'requester' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowTips(!showTips)}
            >
              <Info className="h-4 w-4 mr-1" /> First Aid Tips
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {currentUser?.role === 'requester' && showTips && (
            <div className="px-4 pb-2">
              <Alert className="bg-info/10 border-info/30 text-foreground">
                <AlertDescription>
                  <h4 className="font-semibold mb-1">First Aid Tips</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {firstAidTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <ScrollArea className="flex-grow px-4 pt-2">
            <div className="space-y-4">
              {!messages || messages.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'system' ? 'justify-center' : (msg.sender === (currentUser?.role === 'driver' ? `Driver ${currentUser.name}` : request.userName) ? 'justify-end' : 'justify-start')}`}>
                    {msg.sender === 'system' ? (
                      <div className="bg-muted/30 text-muted-foreground text-xs py-1 px-3 rounded-full">
                        {msg.text}
                      </div>
                    ) : (
                      <div className={`max-w-[80%] ${msg.sender === (currentUser?.role === 'driver' ? `Driver ${currentUser.name}` : request.userName) ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg px-3 py-2`}>
                        {msg.sender !== (currentUser?.role === 'driver' ? `Driver ${currentUser.name}` : request.userName) && (
                          <div className="flex items-center mb-1">
                            <Avatar className="h-5 w-5 mr-2">
                              <AvatarFallback className="text-xs">
                                <UserRound className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">{msg.sender}</span>
                          </div>
                        )}
                        <p>{msg.text}</p>
                        <div className="text-xs opacity-70 text-right mt-1">
                          {format(new Date(msg.timestamp), 'HH:mm')}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
      </CardContent>
      
      <CardFooter className="p-3">
        {(request.status === 'assigned' || request.status === 'in-progress') ? (
          <div className="flex w-full items-center space-x-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow"
            />
            <Button size="icon" onClick={handleSendMessage} disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="w-full text-center text-sm text-muted-foreground">
            {request.status === 'pending' ? 
              "Messaging will be available after an ambulance is assigned." : 
              "This emergency request has been completed."}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default MessageCenter;
