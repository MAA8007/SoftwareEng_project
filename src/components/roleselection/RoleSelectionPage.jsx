// src/components/roleselection/RoleSelectionPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./RoleSelectionPage.css";

function RoleSelectionPage() {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    localStorage.setItem("role", role); // store the role
    if (role === "customer") {
      navigate("/customer-dashboard");
    } else {
      navigate("/delivery-dashboard");
    }
  };

  const username = localStorage.getItem("username");

  return (
    <div className="role-container">
      <h2>Welcome{username ? `, ${username}` : ""}!</h2>
      <p>Select Your Role</p>
      <div className="role-buttons">
        <button onClick={() => handleSelect("customer")}>I’m a Customer</button>
        <button onClick={() => handleSelect("delivery")}>I’m a Delivery Person</button>
      </div>
    </div>
  );
}

export default RoleSelectionPage;
