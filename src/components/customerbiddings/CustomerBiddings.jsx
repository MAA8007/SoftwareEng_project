// src/components/customerbiddings/CustomerBiddings.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CustomerBiddings() {
  const [bids, setBids] = useState([]);
  const [requestId, setRequestId] = useState(null);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/requests/${userId}`)
      .then((res) => res.json())
      .then((requests) => {
        const active = requests.find((req) => req.status === "active");
        if (active) {
          setRequestId(active._id);
          fetch(`http://localhost:5000/api/requests/${active._id}/bids`)
            .then((res) => res.json())
            .then((data) => setBids(data))
            .catch((err) => console.error("Error fetching bids", err));
        }
      })
      .catch((err) => console.error("Error fetching user requests", err));
  }, [userId]);

  const handleSelectBid = (bidId) => {
    if (!requestId) return;

    fetch("http://localhost:5000/api/requests/select-bid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, bidId }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Bid selected!");
        navigate("/customer-dashboard");
      })
      .catch((err) => {
        alert("Failed to select bid");
        console.error(err);
      });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📨 Incoming Bids</h2>
      {bids.length === 0 ? (
        <p>No bids submitted yet.</p>
      ) : (
        <ul>
          {bids.map((bid) => (
            <li key={bid._id} style={{ marginBottom: "1rem", listStyle: "none" }}>
              <p><strong>Price:</strong> Rs {bid.price}</p>
              <p><strong>ETA:</strong> {bid.eta}</p>
              <button onClick={() => handleSelectBid(bid._id)}>Accept Bid</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
