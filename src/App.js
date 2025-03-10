import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/homepage/HomePage";
import LoginPage from "./components/loginpage/LoginPage";
import SignUpPage from "./components/signuppage/SignUpPage";
import CustomerBidding from "./components/customerbiddings/CustomerBiddings";
import CustomerRequests from "./components/customerrequests/CustomerRequests";
import DeliveryBidding from "./components/deliverybidding/DeliveryBidding";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/customer-bidding" element={<CustomerBidding />} />
        <Route path="/customer-requests" element={<CustomerRequests />} />
        <Route path="/delivery-bidding" element={<DeliveryBidding />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
