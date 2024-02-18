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

    getUser(userID).then((fetchedUser) => {
      setOtherUser(fetchedUser);
    }).catch((e) => {
      console.error("Failed to load other user's details:", e);
    })

    const fetchMessages = async () => {
      try {
        const response = await api.get<{ messages: Message[] }>(`/messages?otherUserID=${encodeURIComponent(userID)}`);
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

  const shouldShowProfilePicture = (index: number) => {
    // Always show for the first message
    if (index === 0) return true;
  
    const currentMessage = messages[index];
    const previousMessage = messages[index - 1];
  
    // Show if the message is from a different sender than the previous message
    if (currentMessage.senderID !== previousMessage.senderID) return true;
  
    const currentMessageDate = new Date(currentMessage.sentAt).getTime();
    const previousMessageDate = new Date(previousMessage.sentAt).getTime();
    
    // Calculate the time difference in minutes
    const diffMinutes = (currentMessageDate - previousMessageDate) / (1000 * 60);
  
    // Show if there's a significant time gap (e.g., more than 20 minutes)
    return diffMinutes > 20;
  };
  

  return (
    <div className="message-panel p-4 flex flex-col h-full bg-gray-100 min-h-screen">
      <div className="messages overflow-y-auto flex flex-col gap-4">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className={`chat flex ${msg.senderID === currentUserID ? "justify-end" : "justify-start"}`}>
              {shouldShowProfilePicture(index) && (
                <div className="chat-image avatar -mr-2"> {/* Adjust alignment */}
                  <ProfilePictureOrInitial user={msg.senderID === currentUserID ? user : otherUser} />
                </div>
              )}
              <div className={`chat-bubble ${msg.senderID === currentUserID ? "bg-blue-500 text-white" : "bg-white text-gray-800 shadow"}`}> {/* Improved bubble contrast */}
                <div className="chat-header flex justify-between w-full">
                  <span className="font-bold">{msg.senderID === currentUserID ? user?.name : otherUser?.name}</span>
                  <time className="text-xs text-gray-500">{new Date(msg.sentAt).toLocaleTimeString()}</time>
                </div>
                <p className="text-sm">{msg.text}</p> {/* Ensured text is wrapped in a paragraph for better control */}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-lg text-gray-800 mb-4">No messages yet.</p> {/* Adjusted text color for better visibility */}
          </div>
        )}
      </div>
      <div className="send-message-form mt-4 flex gap-2">
        <textarea
          className="textarea textarea-bordered flex-1"
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
