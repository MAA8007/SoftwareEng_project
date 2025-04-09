import React from "react";
import { useNavigate } from "react-router-dom";
import "./RoleSelectionPage.css";

function RoleSelectionPage() {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    localStorage.setItem("role", role); // store the role
    if (role === "customer") {
      navigate("/customer-Home");
    } else {
      navigate("/delivery-dashboard");
    }
  };

  return (
    <div className="role-container">
      <h2>Select Your Role</h2>
      <div className="role-buttons">
        <button onClick={() => handleSelect("customer")}>I’m a Customer</button>
        <button onClick={() => handleSelect("delivery")}>
          I’m a Delivery Person
        </button>
      </div>
    </div>
  );
}

export default RoleSelectionPage;
