import React, { useState } from "react";
import "./CustomerRequests.css";

function CustomerRequests() {
  const [pickup, setPickup] = useState("");
  const [dorm, setDorm] = useState("");
  const [item, setItem] = useState("");
  const [requests, setRequests] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newRequest = {
      id: Date.now(),
      pickup,
      dorm,
      item,
      status: "Pending"
    };

    setRequests([newRequest, ...requests]);

    // Clear form
    setPickup("");
    setDorm("");
    setItem("");

    // Later: send this request to backend
  };

  return (
    <div className="request-container">
      <h2 className="request-title">Place a Delivery Request</h2>

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
          value={item}
          onChange={(e) => setItem(e.target.value)}
          required
        />
        <button type="submit">Submit Request</button>
      </form>

      <h3 className="previous-title">Your Previous Requests</h3>
      <ul className="request-list">
        {requests.length === 0 ? (
          <p className="no-requests">No requests yet</p>
        ) : (
          requests.map((req) => (
            <li key={req.id} className="request-item">
              <strong>{req.item}</strong> from <em>{req.pickup}</em> to <em>{req.dorm}</em> — Status: <span>{req.status}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default CustomerRequests;
