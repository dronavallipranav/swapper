import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Message } from '../models/Message';

const currentUserID = "users/99-A";

const MessagePanel: React.FC = () => {
  //grab the recipient's user ID from the URL
  const { userId } = useParams<{ userId: string }>(); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get<Message[]>(`/messages/${userId}`);
        setMessages(response.data);
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
      await axios.post('/messages/', messageToSend);
      setMessages([...messages, messageToSend]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="message-panel">
      {}
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="send-message-form">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write a message..."
        ></textarea>
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default MessagePanel;
