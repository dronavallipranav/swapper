import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext"; // Adjust the import path as necessary
import { Message } from "../models/Message";
import { User } from "../models/User";
import api from "../services/AxiosInterceptor";
import { set } from "lodash";
import { useNavigate } from "react-router-dom";
import ProfilePictureOrInitial from "../components/ProfilePictureOrInitial";
import { getUser } from "../services/AuthService";

const ConversationsPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<{ [key: string]: User }>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      setLoading(true); // Assuming you have a loading state

      try {
        // Fetch conversations
        const { data } = await api.get<{ conversations: Message[] }>(
          "/messages/conversations"
        );
        setConversations(data.conversations);

        // Extract unique participant IDs
        const participantIds = new Set<string>();
        data.conversations.forEach((message) => {
          const otherUserId =
            message.senderID === user.id
              ? message.recipientID
              : message.senderID;
          participantIds.add(otherUserId);
        });

        const participantDetailsPromises = Array.from(participantIds).map(
          (id) => getUser(id)
        );

        const results = await Promise.allSettled(participantDetailsPromises);

        const successfulDetails = results.reduce<User[]>((acc, result) => {
          if (result.status === "fulfilled") {
            acc.push(result.value as User);
          }
          return acc;
        }, []);
        
        const participantsMap = successfulDetails.reduce<Record<string, User>>((acc, userDetail) => {
          acc[userDetail.id] = userDetail;
          return acc;
        }, {});

        setParticipants(participantsMap);
      } catch (error) {
        console.error("Failed to fetch conversations or user details:", error);
      } finally {
        setLoading(false); // Ensure loading state is updated in case of success or failure
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
          const otherUserId =
            message.senderID === user?.id
              ? message.recipientID
              : message.senderID;
          const otherUser = participants[otherUserId];
          let url = `/messages/${encodeURIComponent(otherUserId)}`;

          return (
            <li
              key={index}
              className="mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md"
              onClick={() => navigate(url)}
            >
              <div className="flex items-center gap-2">
                <ProfilePictureOrInitial user={otherUser} />
                <div>
                  <div className="font-bold">
                    {otherUser?.name || "Unknown"}
                  </div>
                  <div className="text-sm text-gray-600 overflow-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]">
                    {/* Check if the current user is the sender. If so, prepend "You: " to the message text. */}
                    {message.senderID === user?.id ? `You: ${message.text}` : message.text}
                  </div>
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
