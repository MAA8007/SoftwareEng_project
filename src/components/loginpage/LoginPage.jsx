import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
  
      localStorage.setItem("userId", data.user._id); // ✅ This now saves userId
      navigate("/select-role");
    } catch (err) {
      setError(err.message);
    }
  };
  
  

  return (
    <div className="login-container">
      <h2 className="login-title">Welcome Back!</h2>
      <p className="login-subtitle">Log in to continue using Campus Cart</p>

      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="login-input"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="login-input"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="login-button">Log In</button>
      </form>

      {error && <p className="login-error">{error}</p>}

      <p className="signup-link">
        Don’t have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}

export default LoginPage;
