// src/pages/UserProfile.tsx
import React, { useEffect, useState } from "react";
import { getUser } from "../services/api";
import type { User } from "../types/User";
import ProfileView from "../components/ProfileView";
import { useParams } from "react-router-dom";

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (!username) return;
      try {
        const data = await getUser(username);
        if (!data) {
          setError("User not found");
        } else {
          setUser(data);
        }
      } catch {
        setError("Something went wrong. Please try again later.");
      }
    }
    fetchUser();
  }, [username]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {user ? (
        <ProfileView user={user} />
      ) : (
        <p className="text-gray-600">Loading...</p>
      )}
    </div>
  );
};

export default UserProfile;
