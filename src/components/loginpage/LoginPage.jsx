import React, { useState } from "react";
import "./LoginPage.css";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-container">
      <h1>Log In</h1>
      <input type="text" placeholder="Email or Mobile Number" />
      <div className="password-container">
        <input type={showPassword ? "text" : "password"} placeholder="Password" />
        <span onClick={() => setShowPassword(!showPassword)}>{showPassword ? "🙈" : "👁️"}</span>
      </div>
      <button>Log In</button>
    </div>
  );
}
