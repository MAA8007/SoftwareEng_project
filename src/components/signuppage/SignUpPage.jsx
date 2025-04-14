// src/components/signuppage/SignUpPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUpPage.css";

function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Signup failed");
      }

      localStorage.setItem("userId", data.user._id);
      localStorage.setItem("username", data.user.username); // ✅ Save username (optional)

      navigate("/login"); // You can skip login and go to /select-role instead if preferred
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Create an Account</h2>
      <p className="signup-subtitle">Join Campus Cart today!</p>

      <form className="signup-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Full Name"
          className="signup-input"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="signup-input"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="signup-input"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="signup-button">Sign Up</button>
      </form>

      {error && <p className="signup-error">{error}</p>}

      <p className="login-link">
        Already have an account? <a href="/login">Log in</a>
      </p>
    </div>
  );
}

export default SignUpPage;
