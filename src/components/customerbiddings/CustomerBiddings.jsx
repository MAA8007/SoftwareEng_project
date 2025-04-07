import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CustomerBiddings() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/requests/${userId}`);
        const requests = await res.json();
        const activeRequest = requests.find((r) => r.status === "active");
        if (!activeRequest) return setError("No active request found.");

        const bidRes = await fetch(`http://localhost:5000/api/bids/${activeRequest._id}`);
        const bidData = await bidRes.json();
        setBids(bidData);
      } catch (err) {
        setError("Failed to load bids.");
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [userId]);

  const handleAcceptBid = async (bidId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/requests/select-bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, bidId }),
      });

      if (!res.ok) throw new Error("Failed to accept bid.");

      alert("Bid accepted successfully!");
      navigate("/customer-dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading bids...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Bids for Your Active Request</h2>
      {bids.length === 0 ? (
        <p>No bids available yet.</p>
      ) : (
        bids.map((bid) => (
          <div
            key={bid._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
              background: "#f9f9f9",
            }}
          >
            <p><strong>Delivery Person:</strong> {bid.deliveryPersonName}</p>
            <p><strong>Price:</strong> Rs {bid.price}</p>
            <p><strong>ETA:</strong> {bid.eta}</p>
            <button onClick={() => handleAcceptBid(bid._id)}>Accept Bid</button>
          </div>
        ))
      )}
    </div>
  );
}

export default CustomerBiddings;
