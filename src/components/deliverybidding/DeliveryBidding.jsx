import React, { useState, useEffect } from "react";

const DeliveryDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [bidInput, setBidInput] = useState("");

  const deliveryPerson = "driverA"; // this can be dynamic

  useEffect(() => {
    const interval = setInterval(() => {
      const storedRequests = JSON.parse(
        localStorage.getItem("requests") || "[]"
      );
      setRequests(storedRequests);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const submitBid = () => {
    const allBids = JSON.parse(localStorage.getItem("bids") || "[]");

    const newBid = {
      orderId: `${selectedRequest.order}_${selectedRequest.timestamp}`,
      customer: selectedRequest.customer,
      bidAmount: bidInput,
      deliveryPerson,
      createdAt: Date.now(),
      status: "pending",
    };

    allBids.push(newBid);
    localStorage.setItem("bids", JSON.stringify(allBids));

    alert(`Bid of ₹${bidInput} submitted for ${selectedRequest.order}`);
    setBidInput("");
    setSelectedRequest(null);
  };

  // Notify delivery person of rejected/timeout bids
  useEffect(() => {
    const interval = setInterval(() => {
      const allBids = JSON.parse(localStorage.getItem("bids") || "[]");
      const myNotifications = allBids.filter(
        (bid) =>
          bid.deliveryPerson === deliveryPerson &&
          (bid.status === "rejected" || bid.status === "timeout")
      );

      myNotifications.forEach((n) => {
        alert(`Your bid for ${n.orderId} was ${n.status}`);
      });

      const updatedBids = allBids.map((bid) =>
        myNotifications.includes(bid) ? { ...bid, status: "notified" } : bid
      );

      localStorage.setItem("bids", JSON.stringify(updatedBids));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Delivery Dashboard</h2>
      <ul>
        {requests.map((req, index) => (
          <li key={index}>
            <strong>{req.restaurantName}</strong> → {req.to} | Order:{" "}
            {req.order} | ₹{req.amount}
            <button onClick={() => setSelectedRequest(req)}>Place Bid</button>
          </li>
        ))}
      </ul>

      {selectedRequest && (
        <div className="popup">
          <h3>Place your Bid for: {selectedRequest.order}</h3>
          <input
            value={bidInput}
            onChange={(e) => setBidInput(e.target.value)}
            placeholder="Enter your bid"
          />
          <button onClick={submitBid}>Submit Bid</button>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
