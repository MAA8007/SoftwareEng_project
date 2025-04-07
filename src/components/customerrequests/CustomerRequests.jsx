import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CustomerRequests.css";

function CustomerRequests() {
  const [pickup, setPickup] = useState("");
  const [dorm, setDorm] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userId,
          pickup,
          destination: dorm,
          description
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      alert("Delivery request submitted successfully!");
      navigate("/customer-dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="request-container">
      <h2>Place a Delivery Request</h2>
      <form className="request-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Pickup Location (e.g. Café X)"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Dorm Room (e.g. B-202)"
          value={dorm}
          onChange={(e) => setDorm(e.target.value)}
          required
        />
        <textarea
          placeholder="Item Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button type="submit">Submit Request</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default CustomerRequests;
