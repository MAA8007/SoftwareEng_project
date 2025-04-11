// src/components/deliverydashboard/DeliveryDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import "./DeliveryDashboard.css";
import BidModal from "./BidModal";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const socket = io("http://localhost:5000");

export default function DeliveryDashboard() {
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalRequest, setModalRequest] = useState(null);
  const [justUpdatedId, setJustUpdatedId] = useState(null);

  const deliveryPersonId = localStorage.getItem("userId");

  // ✅ Memoized to fix warning
  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/requests/active?deliveryPersonId=${deliveryPersonId}`);
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  }, [deliveryPersonId]);

  useEffect(() => {
    fetchRequests();

    socket.on("new_request", fetchRequests);
    socket.on("bid_accepted", fetchRequests);

    socket.on("request_status_updated", (updatedRequest) => {
      fetchRequests();
      if (updatedRequest._id !== justUpdatedId) {
        toast.info("📍 Delivery status updated");
      }
      setJustUpdatedId(null);
    });

    return () => {
      socket.off("new_request", fetchRequests);
      socket.off("bid_accepted", fetchRequests);
      socket.off("request_status_updated");
    };
  }, [fetchRequests, justUpdatedId]);

  const openModalForRequest = (request) => {
    setModalRequest(request);
    setShowModal(true);
  };

  const closeModal = () => {
    setModalRequest(null);
    setShowModal(false);
    fetchRequests();
  };

  const updateStatus = async (requestId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/requests/${requestId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success("✅ Status updated");
        setJustUpdatedId(requestId);
        fetchRequests();
      } else {
        toast.error("❌ Failed to update status");
      }
    } catch (err) {
      toast.error("🚨 Error updating status");
    }
  };

  const assignedRequests = requests.filter(
    (req) => req.selectedBid && req.assignedDeliveryPerson === deliveryPersonId
  );
  const availableRequests = requests.filter((req) => !req.selectedBid);

  const getNextStatusButton = (req) => {
    switch (req.status) {
      case "confirmed":
        return <button onClick={() => updateStatus(req._id, "picked up")}>Picked Up</button>;
      case "picked up":
        return <button onClick={() => updateStatus(req._id, "on the way")}>On The Way</button>;
      case "on the way":
        return <button onClick={() => updateStatus(req._id, "completed")}>Complete Delivery</button>;
      default:
        return null;
    }
  };

  return (
    <div className="delivery-dashboard">
      <h2>🚚 Delivery Dashboard</h2>
      <button onClick={fetchRequests}>Refresh Requests</button>

      <h3>Assigned Deliveries</h3>
      {assignedRequests.length === 0 ? (
        <p>No deliveries assigned to you.</p>
      ) : (
        <div className="requests-container">
          {assignedRequests.map((req) => (
            <div className="request-card" key={req._id}>
              <h4>{req.pickup} → {req.destination}</h4>
              <p><strong>Description:</strong> {req.description}</p>
              <p><strong>Status:</strong> {req.status}</p>
              <div className="status-buttons">{getNextStatusButton(req)}</div>
            </div>
          ))}
        </div>
      )}

      <h3>Available Requests</h3>
      {availableRequests.length === 0 ? (
        <p>No available requests to bid on.</p>
      ) : (
        <div className="requests-container">
          {availableRequests.map((req) => (
            <div className="request-card" key={req._id}>
              <h4>{req.pickup} → {req.destination}</h4>
              <p><strong>Description:</strong> {req.description}</p>
              <p><strong>Status:</strong> {req.status}</p>
              <button onClick={() => openModalForRequest(req)}>Place Bid</button>
            </div>
          ))}
        </div>
      )}

      {showModal && modalRequest && (
        <BidModal
          request={modalRequest}
          deliveryPersonId={deliveryPersonId}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
