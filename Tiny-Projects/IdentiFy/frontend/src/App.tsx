// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:username" element={<UserProfile />} />
      </Routes>
    </Router>
  );
};

export default App;
