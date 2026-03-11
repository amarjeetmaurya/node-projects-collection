import React, { useState } from "react";
import { createUser, uploadProfilePicture } from "../services/api";

const ProfileForm: React.FC = () => {
  const [username, setUsername] = useState("Amarjeet");
  const [email, setEmail] = useState("amarjeetmaurya876@gmail.com");
  const [bio, setBio] = useState("Hey! I'm an Alien.");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userRes = await createUser({ username, email, bio });
    const { presignedUrl } = userRes.data;
    console.log(userRes);
    if (file) await uploadProfilePicture(file, presignedUrl);
    alert("Profile created successfully!");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 space-y-4"
    >
      <h2 className="text-2xl font-bold text-gray-800">Create Profile</h2>
      <input
        className="w-full border rounded-md p-2 focus:ring focus:ring-blue-300"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="w-full border rounded-md p-2 focus:ring focus:ring-blue-300"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <textarea
        className="w-full border rounded-md p-2 focus:ring focus:ring-blue-300"
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
      <input
        type="file"
        className="w-full text-gray-600"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        Save Profile
      </button>
    </form>
  );
};

export default ProfileForm;
