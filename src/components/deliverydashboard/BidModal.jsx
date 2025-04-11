// src/components/deliverydashboard/BidModal.jsx
import React, { useState } from "react";
import "./BidModal.css";
import { toast } from "react-toastify";

export default function BidModal({ request, deliveryPersonId, onClose }) {
  const [price, setPrice] = useState("");
  const [eta, setEta] = useState("");

  const submitBid = async () => {
    if (!price || !eta) {
      toast.warn("Please enter both price and ETA");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/requests/${request._id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryPerson: deliveryPersonId, price, eta }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Bid submitted successfully!");
        onClose();
      } else {
        toast.error(data.msg || "Error submitting bid");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting bid");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Place Bid for {request.pickup} → {request.destination}</h3>
        <label>Price (Rs):</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <label>ETA:</label>
        <input
          type="text"
          value={eta}
          onChange={(e) => setEta(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={submitBid}>Submit Bid</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
