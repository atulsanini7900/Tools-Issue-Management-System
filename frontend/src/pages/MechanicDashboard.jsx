import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MechanicDashboard.css";
import { API_BASE_URL } from "../config";

function MechanicDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const [tools, setTools] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Validate session
  useEffect(() => {
    if (!token || !user || user.role !== "mechanic") {
      localStorage.clear();
      navigate("/login");
    } else {
      fetchDashboardData();
    }
  }, [token, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch available tools
      const toolsRes = await fetch(`${API_BASE_URL}/api/tools`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const toolsData = await toolsRes.json();
      if (!toolsRes.ok) throw new Error(toolsData.message || "Failed to load tools.");
      setTools(toolsData);

      // 2. Fetch my issue history
      const issuesRes = await fetch(`${API_BASE_URL}/api/issues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const issuesData = await issuesRes.json();
      if (!issuesRes.ok) throw new Error(issuesData.message || "Failed to load history.");
      setMyIssues(issuesData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueTool = async (toolId) => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/tools/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ toolId, quantity: 1 })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not issue tool.");

      setSuccess(data.message);
      fetchDashboardData(); // Refresh UI

    } catch (err) {
      setError(err.message);
    }
  };

  const handleReturnTool = async (recordId) => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/tools/return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recordId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not return tool.");

      setSuccess(data.message);
      fetchDashboardData(); // Refresh UI

    } catch (err) {
      setError(err.message);
    }
  };

  // Filter tools by category
  const filteredTools = selectedCategory === "All" 
    ? tools 
    : tools.filter(t => t.category === selectedCategory);

  // Separate active issues from returned ones
  const activeIssues = myIssues.filter(log => log.status === "Issued");
  const closedIssues = myIssues.filter(log => log.status === "Returned");

  // Style helper for mechanic levels
  const getLevelBadge = (level) => {
    switch (level) {
      case "Expert": return "badge badge-expert";
      case "Medium": return "badge badge-medium";
      case "New Recruit": return "badge badge-recruit";
      default: return "badge badge-trainee";
    }
  };

  if (!user) return null;

  return (
    <div className="main-content">
      {/* 1. Mechanic Profile Summary Section */}
      <div className="glass-card profile-card">
        {user.picture ? (
          <img src={user.picture} alt={user.name} className="profile-avatar-large" />
        ) : (
          <div className="profile-avatar-placeholder">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="profile-info">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <h2>{user.name}</h2>
            <span className={getLevelBadge(user.level)}>{user.level} Mechanic</span>
          </div>
          <div className="profile-meta">
            <span>📧 {user.email}</span>
            <span>📱 {user.mobileNo}</span>
            <span>🛠️ Role: Workshop Operator</span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* 2. Active Issued Tools Section */}
      <section className="dashboard-section" style={{ marginBottom: "3rem" }}>
        <h3 className="section-title">📦 My Currently Issued Tools ({activeIssues.length})</h3>
        {activeIssues.length === 0 ? (
          <div className="glass-card empty-state">
            <p>You have no tools currently issued. Choose tools from the inventory below.</p>
          </div>
        ) : (
          <div className="grid-4">
            {activeIssues.map((record) => {
              const tool = record.toolId;
              if (!tool) return null;
              return (
                <div key={record._id} className="tool-card active-issue-card">
                  <span className="issued-badge">🟢 Active Issue</span>
                  <div className="tool-image-container">
                    {tool.image ? (
                      <img src={tool.image} alt={tool.name} />
                    ) : (
                      <div className="tool-image-placeholder">🛠️</div>
                    )}
                  </div>
                  <div className="tool-details">
                    <span className="tool-category">{tool.category}</span>
                    <h4 className="tool-title" title={tool.name}>{tool.name}</h4>
                    <p className="issue-date">📅 Issued: {new Date(record.issueDate).toLocaleDateString()} at {new Date(record.issueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <div className="tool-actions" style={{ marginTop: "1rem" }}>
                      <button 
                        onClick={() => handleReturnTool(record._id)} 
                        className="btn btn-accent btn-sm"
                        style={{ width: "100%" }}
                      >
                        ↩ Return Tool Room
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Available Inventory Section */}
      <section className="dashboard-section" style={{ marginBottom: "3rem" }}>
        <div className="section-header-flex">
          <h3 className="section-title">🏪 Available Tools Inventory</h3>
          <div className="category-filter">
            <label htmlFor="category">Category: </label>
            <select 
              id="category" 
              className="form-control filter-dropdown"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Screwdriver">Screwdrivers</option>
              <option value="Wrench">Wrenches</option>
              <option value="Plier">Pliers</option>
              <option value="Hammer">Hammers</option>
              <option value="Saw">Saws</option>
              <option value="Drill">Drills</option>
              <option value="Other">Others</option>
            </select>
          </div>
        </div>

        {loading && <div style={{ textAlign: "center", padding: "2rem" }}>Loading available tools...</div>}

        {!loading && filteredTools.length === 0 ? (
          <div className="glass-card empty-state">
            <p>No tools are available in the selected category.</p>
          </div>
        ) : (
          <div className="grid-4">
            {filteredTools.map((tool) => (
              <div key={tool._id} className="tool-card">
                <div className="tool-image-container">
                  {tool.image ? (
                    <img src={tool.image} alt={tool.name} />
                  ) : (
                    <div className="tool-image-placeholder">🛠️</div>
                  )}
                </div>
                <div className="tool-details">
                  <span className="tool-category">{tool.category}</span>
                  <h4 className="tool-title" title={tool.name}>{tool.name}</h4>
                  <div className="tool-qty">
                    <span>Available Qty:</span>
                    <span className={`qty-number ${tool.quantity === 0 ? "out-of-stock" : ""}`}>
                      {tool.quantity}
                    </span>
                  </div>
                  <div className="tool-actions">
                    <button
                      onClick={() => handleIssueTool(tool._id)}
                      className="btn btn-primary btn-sm"
                      style={{ width: "100%" }}
                      disabled={tool.quantity === 0}
                    >
                      {tool.quantity === 0 ? "❌ Out of Stock" : "⚡ Get Issued"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Personal History Audit Log */}
      <section className="dashboard-section">
        <h3 className="section-title" style={{ marginBottom: "1rem" }}>📖 My Transaction Log</h3>
        {closedIssues.length === 0 ? (
          <div className="glass-card empty-state">
            <p>You have no returned tool history yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tool Image</th>
                  <th>Tool Name</th>
                  <th>Category</th>
                  <th>Issued Date</th>
                  <th>Returned Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {closedIssues.map((log) => {
                  const tool = log.toolId;
                  if (!tool) return null;
                  return (
                    <tr key={log._id}>
                      <td>
                        <div className="table-img-wrapper">
                          {tool.image ? (
                            <img src={tool.image} alt={tool.name} />
                          ) : (
                            <div className="table-img-placeholder">🛠️</div>
                          )}
                        </div>
                      </td>
                      <td><strong>{tool.name}</strong></td>
                      <td>{tool.category}</td>
                      <td>{new Date(log.issueDate).toLocaleString()}</td>
                      <td>{log.returnDate ? new Date(log.returnDate).toLocaleString() : "-"}</td>
                      <td>
                        <span className="status-badge returned">Returned</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default MechanicDashboard;
