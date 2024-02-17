import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Update the import path according to your file structure

const MessagePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const userID = user?.id;

  useEffect(() => {

    if (!isAuthenticated || !user) return;

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/conversations/${userID}`);
        setConversations(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch conversations', error);
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, isAuthenticated]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
     </div>
  );
};

export default MessagePage;
