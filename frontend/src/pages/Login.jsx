import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { API_BASE_URL } from "../config";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect them
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/mechanic");
        }
      } catch (e) {
        localStorage.clear();
      }
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      // Save Auth Data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Login successful! Redirecting to panel...");

      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/mechanic");
        }
      }, 1000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>System Sign In</h2>
        <p>Enter your credentials to access the ToolRoom workspace.</p>
      </div>

      <div className="glass-card login-card-custom">
        <div className="login-avatar-emblem">🔑</div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-icon-wrapper">
              <span className="input-box-icon">📧</span>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control input-pad-left"
                placeholder="mechanic@toolroom.com or admin@toolroom.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "2rem" }}>
            <label htmlFor="password">Password</label>
            <div className="input-icon-wrapper">
              <span className="input-box-icon">🔒</span>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control input-pad-left"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn-gradient"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Verifying..." : "⚡ Log In"}
          </button>
        </form>
      </div>

      <div className="auth-switch">
        <p>New workshop mechanic? <Link to="/signup">Register mechanic account</Link></p>
      </div>
    </div>
  );
}

export default Login;
