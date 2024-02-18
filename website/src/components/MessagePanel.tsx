import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ProfilePictureOrInitial from "./ProfilePictureOrInitial";
import { getUser } from "../services/AuthService";
import api from "../services/AxiosInterceptor";
import { Message } from "../models/Message";
import { User } from "../models/User";

const MessagePanel: React.FC = () => {
  const { user } = useAuth();
  const currentUserID: string = user?.id as string;
  const { userID } = useParams<{ userID: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [otherUser, setOtherUser] = useState<User | null>(null);

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
  }, [user, userID]);

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

  return (
    <div className="message-panel p-4 flex flex-col h-full bg-gray-100 min-h-screen">
      <div className="messages overflow-y-auto flex flex-col gap-2">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat ${
                msg.senderID === currentUserID ? "items-end" : "items-start"
              } flex flex-col`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`chat-image avatar ${
                    msg.senderID === currentUserID ? "order-2" : ""
                  }`}
                >
                  <ProfilePictureOrInitial
                    user={msg.senderID === currentUserID ? user : otherUser}
                  />
                </div>
                <div
                  className={`chat-header text-sm ${
                    msg.senderID === currentUserID ? "text-right" : "text-left"
                  }`}
                >
                  <span className="font-bold">
                    {msg.senderID === currentUserID
                      ? user?.name
                      : otherUser?.name}
                  </span>
                  <time className="text-xs opacity-50 ml-2">
                    {new Date(msg.sentAt).toLocaleTimeString()}
                  </time>
                </div>
              </div>
              <div
                className={`chat-bubble shadow rounded-lg mt-1 ${
                  msg.senderID === currentUserID
                    ? "bg-blue-600 text-white p-3 self-end"
                    : "bg-gray-200 text-gray-800 p-3 self-start"
                }`}
              >
                {msg.text}
              </div>
              <div
                className={`chat-footer text-xs opacity-50 ${
                  msg.senderID === currentUserID ? "self-end" : "self-start"
                }`}
              >
                {msg.senderID === currentUserID ? "Delivered" : ""}
              </div>
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
          placeholder="Write a message..."
        ></textarea>
        <button className="btn btn-primary" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default MessagePanel;
