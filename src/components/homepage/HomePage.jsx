import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import campusCartImage from "../../assets/1.png";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <img src={campusCartImage} alt="Campus Cart" className="home-image" />
      <h1 className="home-title">CAMPUS CART</h1>
      <p className="home-subtitle">Your Campus, Your Delivery, Your Way!</p>

      <div className="home-buttons">
        <button className="home-button login-btn" onClick={() => navigate("/login")}>
          Log In
        </button>
        <button className="home-button signup-btn" onClick={() => navigate("/signup")}>
          Sign Up
        </button>
      </div>

      <p className="home-footer">© 2025 Campus Cart</p>
    </div>
  );
}

export default HomePage;
