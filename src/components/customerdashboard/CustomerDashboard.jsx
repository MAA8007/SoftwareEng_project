import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CustomerDashboard.css"; // keep your styles

const CustomerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const restaurantName = location.state?.restaurantName || "Restaurant";
  const customerEmail = location.state?.email || "guest@example.com";

  const [to, setTo] = useState("");
  const [order, setOrder] = useState("");
  const [amount, setAmount] = useState("");
  const [activeBids, setActiveBids] = useState([]);

  // Handle delivery request submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const request = {
      restaurantName,
      to,
      order,
      amount,
      timestamp: Date.now(),
      customer: customerEmail,
      orderId: `${customerEmail}-${Date.now()}`,
    };

    const existing = JSON.parse(localStorage.getItem("requests") || "[]");
    existing.push(request);
    localStorage.setItem("requests", JSON.stringify(existing));

    alert("Request submitted!");

    setTo("");
    setOrder("");
    setAmount("");
  };

  // Check bids every second to show active bids for this customer only
  useEffect(() => {
    const interval = setInterval(() => {
      const allBids = JSON.parse(localStorage.getItem("bids") || "[]");
      const now = Date.now();

      const myBids = allBids.filter(
        (bid) =>
          bid.customer === customerEmail &&
          bid.status === "pending" &&
          now - bid.createdAt <= 10000
      );

      // Auto-expire old bids
      const updatedBids = allBids.map((bid) => {
        if (
          bid.customer === customerEmail &&
          bid.status === "pending" &&
          now - bid.createdAt > 10000
        ) {
          return { ...bid, status: "timeout" };
        }
        return bid;
      });

      localStorage.setItem("bids", JSON.stringify(updatedBids));
      setActiveBids(myBids);
    }, 1000);

    return () => clearInterval(interval);
  }, [customerEmail]);

  const acceptBid = (bid) => {
    const allBids = JSON.parse(localStorage.getItem("bids") || "[]").map((b) =>
      b.orderId === bid.orderId && b.customer === bid.customer
        ? { ...b, status: "accepted" }
        : b
    );
    localStorage.setItem("bids", JSON.stringify(allBids));
    navigate("/receipt", { state: { bid, accepted: true } });
  };

  const rejectBid = (bid) => {
    const allBids = JSON.parse(localStorage.getItem("bids") || "[]").map((b) =>
      b.orderId === bid.orderId && b.customer === bid.customer
        ? { ...b, status: "rejected" }
        : b
    );
    localStorage.setItem("bids", JSON.stringify(allBids));
  };

  return (
    <div className="dashboard-container">
      <h2>Customer Dashboard</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Restaurant</label>
          <input
            value={restaurantName}
            readOnly // since it's passed from previous page
            placeholder="Restaurant"
          />
        </div>

        <div className="input-group">
          <label>To (Location)</label>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="To (Location)"
          />
        </div>

        <div className="input-group">
          <label>Order Details</label>
          <input
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            placeholder="Order Details"
          />
        </div>

        <div className="input-group">
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
          />
        </div>

        <button type="submit">Submit Request</button>
      </form>

      <h3>Incoming Bids</h3>
      {activeBids.map((bid, idx) => (
        <div key={idx} className="bid-card">
          <p>🚚 Bid Received: ₹{bid.bidAmount}</p>
          <button onClick={() => acceptBid(bid)}>Accept</button>
          <button onClick={() => rejectBid(bid)}>Reject</button>
        </div>
      ))}
    </div>
  );
};

export default CustomerDashboard;
