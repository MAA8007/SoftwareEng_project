// src/components/navbar/Navbar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("userId");
  const showSettings = location.pathname === "/select-role";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h1 className="logo">Campus Cart</h1>

      <div className="navbar-buttons">
        {showSettings && (
          <Link to="/settings" className="settings-btn">⚙️ Settings</Link>
        )}
        {isLoggedIn && (
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        )}
      </div>
    </nav>
  );
}
