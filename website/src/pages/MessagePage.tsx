import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Adjust the import path as necessary
import { Message } from "../models/Message";
import { User } from "../models/User";
import api from '../services/AxiosInterceptor';
import { set } from 'lodash';

const ConversationsPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<{ [key: string]: User }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      try {
        const { data } = await api.get<{ conversations: Message[] }>('/messages/conversations');
        const participantIds = data.conversations.reduce<string[]>((acc, message) => {
          const otherUserId = message.senderID === user.id ? message.recipientID : message.senderID;
          if (!acc.includes(otherUserId)) acc.push(otherUserId);
          return acc;
        }, []);
        setConversations(data.conversations);
        console.log(data);
        console.log(conversations);
        const participantDetails: User[] = await Promise.all(
          participantIds.map(async (id) => {
            const response = await api.get<User>(`/${id}`);
            console.log(response.data);
            return response.data;
          })
        );

        const participantsMap: { [key: string]: User } = participantDetails.reduce<{ [key: string]: User }>((acc, currentUser) => {
          acc[currentUser.id] = currentUser;
          return acc;
        }, {});

        setParticipants(participantsMap);
      } catch (error) {
        console.error('Failed to fetch conversations or user details:', error);
      }
    };

    fetchConversations();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!conversations.length) {
    return <div className="text-center p-4">No messages yet.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Conversations</h1>
      <ul>
        {conversations.map((message, index) => {
          const otherUserId = message.senderID === user?.id ? message.recipientID : message.senderID;
          const otherUser = participants[otherUserId];
          console.log(otherUser);
          return (
            <li key={index} className="mb-2">
              <div className="flex items-center gap-2">
                {otherUser?.profilePicture ? (
                  <img src={otherUser.profilePicture} alt={otherUser.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    {otherUser?.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-bold">{otherUser?.name}</div>
                  <div className="text-sm text-gray-600">{message.text}</div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ConversationsPage;
