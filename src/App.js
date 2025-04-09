import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/homepage/HomePage";
import LoginPage from "./components/loginpage/LoginPage";
import SignUpPage from "./components/signuppage/SignUpPage";
import CustomerBiddings from "./components/customerbiddings/CustomerBiddings";
import CustomerRequests from "./components/customerrequests/CustomerRequests";
import DeliveryBidding from "./components/deliverybidding/DeliveryBidding";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import RoleSelectionPage from "./components/roleselection/RoleSelectionPage";
import CustomerDashboard from "./components/customerdashboard/CustomerDashboard";
import CustomerHome from "./components/RestaurantListPage/RestaurantList";
import DeliveryDetailsPage from "./components/DeliveryDetails/DeliveryDetailsPage";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/customer-bidding" element={<CustomerBiddings />} />
        <Route path="/customer-requests" element={<CustomerRequests />} />
        <Route path="/select-role" element={<RoleSelectionPage />} />
        <Route path="/delivery-dashboard" element={<DeliveryBidding />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/customer-Home" element={<CustomerHome />} />
        <Route path="/delivery-details" element={<DeliveryDetailsPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
