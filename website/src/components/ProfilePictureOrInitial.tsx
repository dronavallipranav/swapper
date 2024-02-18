import React from 'react';
import { User } from "../models/User";

const ProfilePictureOrInitial: React.FC<{ user: User | null }> = ({ user }) => {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
      {user?.profilePicture ? (
        <img src={user.profilePicture} alt={`${user.name}'s Profile`} className="object-cover w-full h-full" />
      ) : (
        <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl flex items-center justify-center leading-none">{user?.name ? user.name.charAt(0).toUpperCase() : "?"}</span>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureOrInitial;
