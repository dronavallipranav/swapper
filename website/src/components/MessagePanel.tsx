import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ProfilePictureOrInitial from "./ProfilePictureOrInitial";
import { getUser } from "../services/AuthService";
import api from "../services/AxiosInterceptor";
import { Message } from "../models/Message";
import { User } from "../models/User";
import Header from "./Header";
const MessagePanel: React.FC = () => {
  const { user } = useAuth();
  const currentUserID: string = user?.id as string;
  const { userID } = useParams<{ userID: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [groupedMessages, setGroupedMessages] = useState<GroupedMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageToSend: Message = {
      senderID: currentUserID,
      recipientID: userID as string,
      text: newMessage,
      sentAt: new Date(),
    };

    try {
      await api.post("/messages", messageToSend);
      setMessages([...messages, messageToSend]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  interface GroupedMessage {
    user: string;
    messages: Message[];
  }
  
  const groupMessages = (messages: Message[]): GroupedMessage[] => {
    const grouped: GroupedMessage[] = [];
    messages.forEach((msg: Message) => {
      const lastGroup = grouped[grouped.length - 1];
      const lastMessage = lastGroup?.messages[lastGroup.messages.length - 1];
      const timeDifference = lastMessage
        ? (new Date(msg.sentAt).getTime() - new Date(lastMessage.sentAt).getTime()) / 60000
        : null;
    
      //check if last message was sent within 5 minutes and by the same user
      if (lastGroup && lastMessage && timeDifference !== null && timeDifference <= 5 && lastMessage.senderID === msg.senderID) {
        lastGroup.messages.push(msg);
      } else {
        grouped.push({
          user: msg.senderID,
          messages: [msg]
        });
      }
    });
    return grouped;
  };

  useEffect(() => {
    if (!user || !userID) return;

    getUser(userID)
      .then((fetchedUser) => {
        setOtherUser(fetchedUser);
      })
      .catch((e) => {
        console.error("Failed to load other user's details:", e);
      });

    const fetchMessages = async () => {
      try {
        const response = await api.get<{ messages: Message[] }>(
          `/messages?otherUserID=${encodeURIComponent(userID)}`
        );
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    fetchMessages();
    if (messages.length > 0) {
      const groupedMessages = groupMessages(messages);
      setGroupedMessages(groupedMessages);
    }
  }, [user, userID, messages]);

  return (
    <div>
      <Header />
    <div className="message-panel p-4 flex flex-col justify-between h-full bg-gray-100 min-h-screen">
<div ref={messagesEndRef} className="messages overflow-y-auto flex flex-col gap-2">
  {groupedMessages.length > 0 ? (
    groupedMessages.map((group, groupIndex) => (
      <div key={groupIndex} className="flex flex-col">
        {group.messages.map((msg, index) => (
          <div
            key={index}
            className={`chat ${msg.senderID === currentUserID ? "items-start" : "items-end"} flex flex-col`}
          >
            {index === 0 && (
              // Adjust the flex container to align based on the sender
              <div className={`flex ${msg.senderID === currentUserID ? "flex-row" : "flex-row-reverse"} items-center gap-2`}>
                <div className="chat-image avatar">
                  <ProfilePictureOrInitial user={msg.senderID === currentUserID ? user : otherUser} />
                </div>
                <div className={`chat-header text-sm ${msg.senderID === currentUserID ? "text-left" : "text-right"}`}>
                  <span className="font-bold">{msg.senderID === currentUserID ? user?.name : otherUser?.name}</span>
                  <time className="text-xs opacity-50 ml-2">
                    {new Date(msg.sentAt).toLocaleTimeString()}
                  </time>
                </div>
              </div>
            )}
            <div
              className={`chat-bubble shadow rounded-lg mt-1 ${msg.senderID === currentUserID ? "bg-blue-600 text-white p-3 self-start" : "bg-gray-200 text-gray-800 p-3 self-end"}`}
            >
              {msg.text}
            </div>
            {index === group.messages.length - 1 && (
              <div className={`chat-footer text-xs opacity-50 ${msg.senderID === currentUserID ? "self-start" : "self-end"}`}>
                {msg.senderID === currentUserID ? "Delivered" : ""}
              </div>
            )}
          </div>
        ))}
      </div>
    ))
  ) : (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-lg text-gray-800 mb-4">No messages yet.</p>
    </div>
  )}
</div>
      <div className="send-message-form mt-4 flex gap-2">
        <textarea
          className="textarea textarea-bordered flex-1 p-2"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }
        }
          placeholder="Write a message..."
        ></textarea>
        <button className="btn btn-primary" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
    </div>
  );
};

export default MessagePanel;
