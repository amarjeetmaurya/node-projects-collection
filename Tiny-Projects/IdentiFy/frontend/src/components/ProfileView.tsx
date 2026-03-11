import React from "react";
import type { User } from "../types/User";

interface Props {
  user: User;
}

const ProfileView: React.FC<Props> = ({ user }) => {
  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 text-center">
      {user.profilePictureUrl && (
        <img
          src={user.profilePictureUrl}
          alt="Profile"
          className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-500"
        />
      )}
      <h2 className="text-xl font-semibold text-gray-800">{user.username}</h2>
      <p className="text-gray-600">{user.bio}</p>
    </div>
  );
};

export default ProfileView;
