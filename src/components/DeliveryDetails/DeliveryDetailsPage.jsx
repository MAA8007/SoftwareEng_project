// DeliveryDetailsPage.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import "./DeliveryDetailsPage.css";

export default function DeliveryDetailsPage() {
  const { state } = useLocation();
  const { restaurant, destination, order, amount, bidAmount } = state;

  return (
    <div className="delivery-details">
      <div className="receipt">
        <h2>📋 Delivery Details</h2>
        <p>
          <strong>Restaurant:</strong> {restaurant}
        </p>
        <p>
          <strong>Destination:</strong> {destination}
        </p>
        <p>
          <strong>Order:</strong> {order}
        </p>
        <p>
          <strong>Customer Offer:</strong> Rs {amount}
        </p>
        {bidAmount && (
          <p>
            <strong>Your Bid:</strong> Rs {bidAmount}
          </p>
        )}
      </div>
    </div>
  );
}
