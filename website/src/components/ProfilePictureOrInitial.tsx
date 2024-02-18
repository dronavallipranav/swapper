import { User } from "../models/User";

const ProfilePictureOrInitial: React.FC<{ user: User | null }> = ({ user }) => {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 text-xl font-semibold flex items-center justify-center">
      {user?.profilePicture ? (
        <img src={user.profilePicture} alt={`${user.name}'s Profile`} className="object-cover w-full h-full" />
      ) : (
        <span className="text-white font-bold">{user?.name ? user.name.charAt(0).toUpperCase() : "?"}</span>
      )}
    </div>
  );
};

export default ProfilePictureOrInitial;
