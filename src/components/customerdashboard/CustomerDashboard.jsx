import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CustomerDashboard.css";

function CustomerDashboard() {
  const [activeRequest, setActiveRequest] = useState(null);
  const [pastRequests, setPastRequests] = useState([]);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/requests/${userId}`);
        const data = await res.json();
        if (!Array.isArray(data)) return;

        const active = data.find((r) => r.status !== "completed");
        const past = data.filter((r) => r.status === "completed");

        setActiveRequest(active);
        setPastRequests(past);
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    };
    fetchRequests();
  }, [userId]);

  return (
    <div className="dashboard-container">
      <h2>Welcome back to Campus Cart 👋</h2>

      {activeRequest ? (
        <div className="request-card">
          <h3>🟡 Active Request</h3>
          <p>{activeRequest.pickup} → {activeRequest.destination}</p>
          <p>Status: {activeRequest.status}</p>
          <button
            className="secondary-btn"
            onClick={() =>
              navigate("/customer-bidding", {
                state: { requestId: activeRequest._id }
              })
            }
          >
            View Bids
          </button>
        </div>
      ) : (
        <button
          className="primary-btn"
          onClick={() => navigate("/customer-requests")}
        >
          Make a Delivery Request
        </button>
      )}

      <h3>✅ Past Deliveries</h3>
      {pastRequests.length === 0 ? (
        <p>No past deliveries yet.</p>
      ) : (
        <ul>
          {pastRequests.map((req) => (
            <li key={req._id}>
              {req.pickup} → {req.destination} — Delivered
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CustomerDashboard;
