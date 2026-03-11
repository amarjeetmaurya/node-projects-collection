import React from "react";
import ProfileForm from "../components/ProfileForm";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <ProfileForm />
    </div>
  );
};

export default Home;
