// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import HomePage from "./components/homepage/HomePage";
import LoginPage from "./components/loginpage/LoginPage";
import SignUpPage from "./components/signuppage/SignUpPage";
import CustomerBiddings from "./components/customerbiddings/CustomerBiddings";
import CustomerRequests from "./components/customerrequests/CustomerRequests";
import DeliveryDashboard from "./components/deliverydashboard/DeliveryDashboard";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import RoleSelectionPage from "./components/roleselection/RoleSelectionPage";
import CustomerDashboard from "./components/customerdashboard/CustomerDashboard";
import Settings from "./components/settings/Settings";

function RequireAuth({ children }) {
  const isAuthenticated = !!localStorage.getItem("userId");
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        
        <Route path="/customer-bidding" element={
          <RequireAuth><CustomerBiddings /></RequireAuth>
        } />
        <Route path="/customer-requests" element={
          <RequireAuth><CustomerRequests /></RequireAuth>
        } />
        <Route path="/select-role" element={
          <RequireAuth><RoleSelectionPage /></RequireAuth>
        } />
        <Route path="/delivery-dashboard" element={
          <RequireAuth><DeliveryDashboard /></RequireAuth>
        } />
        <Route path="/customer-dashboard" element={
          <RequireAuth><CustomerDashboard /></RequireAuth>
        } />
        <Route path="/settings" element={
          <RequireAuth><Settings /></RequireAuth>
        } />
      </Routes>
      <Footer />
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
    </Router>
  );
}

export default App;
