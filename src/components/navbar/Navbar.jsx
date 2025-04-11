// src/components/navbar/Navbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const showSettings = location.pathname === "/select-role";

  return (
    <>
      <nav className="navbar">
        <h1 className="logo">Campus Cart</h1>
      </nav>
      {showSettings && (
        <Link to="/settings" className="settings-icon">
          ⚙️ Settings
        </Link>
      )}
    </>
  );
}
