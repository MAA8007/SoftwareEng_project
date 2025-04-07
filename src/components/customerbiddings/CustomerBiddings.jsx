import React, { useState } from "react";
import "./CustomerBiddings.css";

function CustomerBiddings() {
  const [bids, setBids] = useState([
    {
      id: 1,
      name: "Ali",
      price: 200,
      eta: "15 mins",
    },
    {
      id: 2,
      name: "Fatima",
      price: 180,
      eta: "12 mins",
    },
    {
      id: 3,
      name: "Usman",
      price: 150,
      eta: "20 mins",
    }
  ]);

  const [acceptedBid, setAcceptedBid] = useState(null);

  const handleAccept = (bidId) => {
    const bid = bids.find((b) => b.id === bidId);
    setAcceptedBid(bid);
  };

  return (
    <div className="bidding-container">
      <h2 className="bidding-title">Available Bids for Your Request</h2>

      {acceptedBid ? (
        <div className="accepted-message">
          You have accepted <strong>{acceptedBid.name}’s</strong> bid for <strong>Rs. {acceptedBid.price}</strong> — ETA: {acceptedBid.eta}
        </div>
      ) : (
        <ul className="bid-list">
          {bids.map((bid) => (
            <li key={bid.id} className="bid-card">
              <div className="bid-info">
                <p><strong>{bid.name}</strong></p>
                <p>Price: Rs. {bid.price}</p>
                <p>ETA: {bid.eta}</p>
              </div>
              <button className="accept-button" onClick={() => handleAccept(bid.id)}>
                Accept Bid
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CustomerBiddings;
