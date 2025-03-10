import React from "react";
import "./CustomerBiddings.css";

export default function CustomerBidding() {
  return (
    <div className="bidding-container">
      <h2>From Jammin Java</h2>
      <h3>Straight To You</h3>
      <input type="text" placeholder="Enter Amount" />
      <button>Bid</button>
    </div>
  );
}
