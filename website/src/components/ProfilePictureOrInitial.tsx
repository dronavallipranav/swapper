import { User } from "../models/User";

const ProfilePictureOrInitial: React.FC<{ user: User | null }> = ({ user }) => {
  if (!user) {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-gray-200 text-xl font-semibold">
        {"?"}
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-gray-200 text-xl font-semibold">
      {user.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={`${user.name}'s Profile`}
          className="w-full h-full object-cover"
        />
      ) : user.name ? (
        user.name.charAt(0).toUpperCase()
      ) : (
        "?"
      )}
    </div>
  );
};

export default ProfilePictureOrInitial;
