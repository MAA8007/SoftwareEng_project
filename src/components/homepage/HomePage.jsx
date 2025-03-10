import React from "react";
import "./HomePage.css";
import campusCartImage from "../../assets/1.png"; // Ensure the image is in /src/assets/

function HomePage() {
  return (
    <div className="home-container">
      <img src={campusCartImage} alt="Campus Cart" className="home-image" />
      <h1 className="home-title">CAMPUS CART</h1>
      <p className="home-subtitle">Your Campus, Your Delivery, Your Way!</p>
      
      {/* Buttons Section */}
      <div className="home-buttons">
        <button className="home-button order-btn">Order Now</button>
        <button className="home-button login-btn">Log In</button>
        <button className="home-button signup-btn">Sign Up</button>
      </div>

      <p className="home-footer">© 2025 Campus Cart</p>
    </div>
  );
}

export default HomePage;
