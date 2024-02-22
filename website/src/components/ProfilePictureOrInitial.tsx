import React from "react";
import { User } from "../models/User";
import { link } from "fs";
import { useNavigate } from "react-router-dom";

const ProfilePictureOrInitial: React.FC<{
  user: User | null;
  linkToProfile: boolean;
}> = ({ user, linkToProfile }) => {
  const nav = useNavigate();
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
      {user?.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={`${user.name}'s Profile`}
          className={`object-cover w-full h-full ${
            linkToProfile ? "cursor-pointer" : ""
          }`}
          onClick={() => {
            
            if (linkToProfile) {
              console.log(user.id);
              nav(`/profile/${encodeURIComponent(user.id)}`);
            }
          }}
        />
      ) : (
        <div className={`w-full h-full bg-blue-500 rounded-full flex items-center justify-center ${
          linkToProfile ? "cursor-pointer" : ""
        }`}
        onClick={() => {
          if (linkToProfile && user) {
            nav(`/profile/${user.id.replace("users/", "")}`);
          }
        }}
        >
          <span
            className="text-white font-bold text-xl flex items-center justify-center leading-none"

          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureOrInitial;
