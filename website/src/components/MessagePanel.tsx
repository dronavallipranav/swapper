import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Message } from '../models/Message';
import api from '../services/AxiosInterceptor';
import { useAuth } from '../contexts/AuthContext';

const MessagePanel: React.FC = () => {
  const { user } = useAuth();
  const currentUserID:string = user?.id as string;
  //grab the recipient's user ID from the URL
  const { userID } = useParams<{ userID: string }>(); 
  const userId = userID?.replace(/_/g, "/");
  console.log(userId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        //fetch all messages in the conversation
        const response = await api.get<{messages :Message[]}>(`/messages?otherUserID=${encodeURIComponent(userId as string)}`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    fetchMessages();
  }, [userId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageToSend: Message = {
      senderID: currentUserID,
      recipientID: userId as string,
      text: newMessage,
      sentAt: null as any as Date,
    };

    try {
      await api.post('/messages', messageToSend);
      setMessages([...messages, messageToSend]);
      setNewMessage("");
      console.log(messages);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="message-panel p-4 flex flex-col h-screen">
      <div className="messages flex-1 overflow-y-auto flex flex-col gap-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message p-2 rounded-lg max-w-md ${
              msg.senderID === currentUserID ? 'mr-auto bg-blue-500 text-white' : 'ml-auto bg-gray-200'
            }`}
          >
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="send-message-form mt-4">
        <textarea
          className="textarea textarea-bordered w-full mb-2"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write a message..."
        ></textarea>
        <button className="btn btn-primary" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default MessagePanel;
