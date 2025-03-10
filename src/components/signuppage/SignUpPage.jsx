import React, { useState } from "react";
import "./SignUpPage.css";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="signup-container">
      <h1>New Account</h1>
      <input type="text" placeholder="Full Name" />
      <input type="email" placeholder="Email" />
      <div className="password-container">
        <input type={showPassword ? "text" : "password"} placeholder="Password" />
        <span onClick={() => setShowPassword(!showPassword)}>{showPassword ? "🙈" : "👁️"}</span>
      </div>
      <button>Sign Up</button>
    </div>
  );
}
