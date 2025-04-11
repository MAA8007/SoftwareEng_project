// src/components/customerdashboard/CustomerDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./CustomerDashboard.css";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const socket = io("http://localhost:5000");

function CustomerDashboard() {
  const [activeRequest, setActiveRequest] = useState(null);
  const [pastRequests, setPastRequests] = useState([]);
  const [bids, setBids] = useState([]);
  const [selectedBid, setSelectedBid] = useState(null);

  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  // ✅ Memoized to avoid ESLint warning
  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/requests/user/${userId}`);
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const active = data.find((r) => r.status !== "completed" && r.status !== "canceled");
      const past = data.filter((r) => r.status === "completed");

      setActiveRequest(active);
      setPastRequests(past);

      if (active) {
        setSelectedBid(active.bids.find((b) => b._id === active.selectedBid));
        if (!active.selectedBid) {
          const bidRes = await fetch(`http://localhost:5000/api/requests/${active._id}/bids`);
          const bidData = await bidRes.json();
          setBids(bidData);
        }
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  }, [userId]);

  const handleAcceptBid = async (bidId) => {
    try {
      const res = await fetch("http://localhost:5000/api/requests/select-bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, bidId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Bid accepted!");
        socket.emit("bid_accepted", { requestId: activeRequest._id });
        fetchRequests();
      } else {
        toast.error(data.msg || "Failed to accept bid");
      }
    } catch (err) {
      toast.error("Error accepting bid");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();

    socket.on("new_bid", fetchRequests);
    socket.on("request_status_updated", fetchRequests);

    return () => {
      socket.off("new_bid", fetchRequests);
      socket.off("request_status_updated", fetchRequests);
    };
  }, [fetchRequests]);

  return (
    <div className="dashboard-container">
      <h2>Welcome back to Campus Cart 👋</h2>

      {activeRequest ? (
        <div className="request-card">
          <h3>🟡 Active Request</h3>
          <p>{activeRequest.pickup} → {activeRequest.destination}</p>
          <p>Status: {activeRequest.status}</p>

          {selectedBid ? (
            <div>
              <h4>✅ Accepted Bid</h4>
              <p><strong>Price:</strong> Rs {selectedBid.price}</p>
              <p><strong>ETA:</strong> {selectedBid.eta}</p>
            </div>
          ) : (
            <>
              <h4>📨 Incoming Bids</h4>
              {bids.length === 0 ? (
                <p>No bids submitted yet.</p>
              ) : (
                <ul>
                  {bids.map((bid) => (
                    <li key={bid._id}>
                      <p><strong>Price:</strong> Rs {bid.price}</p>
                      <p><strong>ETA:</strong> {bid.eta}</p>
                      <button onClick={() => handleAcceptBid(bid._id)}>Accept Bid</button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      ) : (
        <button className="primary-btn" onClick={() => navigate("/customer-requests")}>
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
