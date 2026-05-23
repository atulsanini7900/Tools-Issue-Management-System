import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">
          Smart Toolroom <span className="blue-gradient">Issue Management</span>
        </h1>
        <p className="hero-subtitle">
          An automated system for mechanics to issue, track, and return workshop tools seamlessly. Track available quantities in real-time and maintain digital logs.
        </p>

        <div className="hero-cta-buttons">
          {token && user ? (
            <Link
              to={user.role === "admin" ? "/admin" : "/mechanic"}
              className="btn btn-primary btn-lg"
            >
              Go to Your Panel ({user.role === "admin" ? "Admin" : "Mechanic"}) ➔
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary btn-lg">
                Log In to Workspace
              </Link>
              <Link to="/signup" className="btn btn-secondary btn-lg">
                Mechanic Registration
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="features-grid grid-3">
        <div className="feature-card glass-card">
          <div className="feature-icon">🛡️</div>
          <h3>Secure Authentication</h3>
          <p>
            Alphanumeric passwords with special characters protect mechanic registration. Unique emails & mobile numbers ensure authentic entries.
          </p>
        </div>

        <div className="feature-card glass-card">
          <div className="feature-icon">📊</div>
          <h3>Real-time Inventory</h3>
          <p>
            Displays available tools, active categories, images, and live quantities. System automatically blocks issues exceeding current stock.
          </p>
        </div>

        <div className="feature-card glass-card">
          <div className="feature-icon">📑</div>
          <h3>Global Issue Register</h3>
          <p>
            Detailed logs showing issue dates, return dates, statuses, and mechanic information. Complete records of active and closed transactions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
