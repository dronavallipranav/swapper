import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Message } from '../models/Message';
import api from '../services/AxiosInterceptor';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../models/User';

const MessagePanel: React.FC = () => {
  const { user } = useAuth();

  const currentUserID:string = user?.id as string;
  
  //grab the recipient's user ID from the URL
  const { userID } = useParams<{ userID: string }>(); 
  const userId = userID?.replace(/_/g, "/");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [otherUser, setOtherUser] = useState<User | null>(null); // State to hold the other user's details
  const [currentUser, setCurrentUser] = useState<User | null>(null); // State to hold the current user's details

  useEffect(() => {
    if (!user || !userId) return;
    // Fetch the other user's details
    const fetchOtherUser = async () => {
      try {
        const response = await api.get<User>(`/${encodeURIComponent(userId as string)}`);
        setOtherUser(response.data);
      } catch (error) {
        console.error("Failed to load other user's details:", error);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        console.log(user?.id);
        const response = await api.get<User>(`/${encodeURIComponent(user?.id as string)}`);
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Failed to load user's details:", error);
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await api.get<{ messages: Message[] }>(`/messages?otherUserID=${encodeURIComponent(userId as string)}`);
        setMessages(response.data.messages);
        fetchCurrentUser(); 
        fetchOtherUser();
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    if (userId) {
      fetchMessages();
    }
  }, [user, userId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageToSend: Message = {
      senderID: currentUserID,
      recipientID: userId as string,
      text: newMessage,
      sentAt: new Date(),
    };

    try {
      await api.post('/messages', messageToSend);
      setMessages([...messages, messageToSend]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const shouldShowProfilePicture = (index: number) => {
    if (index === 0) return true;
    const currentMessageDate = new Date(messages[index].sentAt);
    const previousMessageDate = new Date(messages[index - 1].sentAt);
    const diffMinutes = (currentMessageDate.getTime() - previousMessageDate.getTime()) / (1000 * 60);
    return diffMinutes > 20;
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg mb-4">No messages yet.</p>
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
  }

  return (
    <div className="message-panel p-4 flex flex-col h-screen">
      <div className="messages flex-1 overflow-y-auto flex flex-col gap-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.senderID === currentUserID ? 'items-start' : 'items-end'}`}>
            {shouldShowProfilePicture(index) && (
              <div className="flex items-center">
                <img src={msg.senderID === currentUserID ? currentUser?.profilePicture : otherUser?.profilePicture} alt="Profile" className="w-10 h-10 rounded-full mr-2" />
                <span className="text-sm font-semibold">{msg.senderID === currentUserID ? currentUser?.username : otherUser?.username}</span>
              </div>
            )}
            <div className={`p-2 rounded-lg max-w-md ${msg.senderID === currentUserID ? 'bg-gray-200' : 'bg-blue-500 text-white'}`}>
              <p>{msg.text}</p>
            </div>
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
