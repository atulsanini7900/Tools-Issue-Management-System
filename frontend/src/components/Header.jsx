import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path ? "nav-link active" : "nav-link";
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="logo-section">
          <div className="logo-icon">🔧</div>
          <span className="logo-text">ToolRoom <span className="highlight">IMS</span></span>
        </Link>

        <nav className="nav-menu">
          {token && user ? (
            <>
              {user.role === "admin" ? (
                <Link to="/admin" className={isActive("/admin")}>
                  Admin Panel
                </Link>
              ) : (
                <Link to="/mechanic" className={isActive("/mechanic")}>
                  Mechanic Panel
                </Link>
              )}
              <div className="user-profile-snippet">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="avatar-mini" />
                ) : (
                  <div className="avatar-mini-placeholder">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="user-text-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
                <button onClick={handleLogout} className="btn-logout" title="Log Out">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className={isActive("/login")}>
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Register Mechanic
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
