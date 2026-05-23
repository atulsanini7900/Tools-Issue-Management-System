import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import { API_BASE_URL } from "../config";

function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const [tools, setTools] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New Tool Form State
  const [newTool, setNewTool] = useState({
    name: "",
    category: "Screwdriver",
    quantity: 0,
    image: ""
  });
  const [toolPreview, setToolPreview] = useState("");

  // Validate Admin Role
  useEffect(() => {
    if (!token || !user || user.role !== "admin") {
      localStorage.clear();
      navigate("/login");
    } else {
      fetchAdminData();
    }
  }, [token, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch available tools
      const toolsRes = await fetch(`${API_BASE_URL}/api/tools`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const toolsData = await toolsRes.json();
      if (!toolsRes.ok) throw new Error(toolsData.message || "Failed to load tools.");
      setTools(toolsData);

      // Fetch full issue history
      const issuesRes = await fetch(`${API_BASE_URL}/api/issues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const issuesData = await issuesRes.json();
      if (!issuesRes.ok) throw new Error(issuesData.message || "Failed to load issue history.");
      setIssues(issuesData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTool(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Tool image size must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewTool(prev => ({
        ...prev,
        image: reader.result
      }));
      setToolPreview(reader.result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleAddToolSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { name, category, quantity, image } = newTool;

    if (!name || !category) {
      setError("Please fill out Tool Name and Category.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/tools`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          category,
          quantity: parseInt(quantity) || 0,
          image
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add tool to inventory.");

      setSuccess("New tool added successfully to the inventory!");
      setNewTool({
        name: "",
        category: "Screwdriver",
        quantity: 0,
        image: ""
      });
      setToolPreview("");
      fetchAdminData();

    } catch (err) {
      setError(err.message);
    }
  };

  // Compute Metrics
  const totalToolTypes = tools.length;
  const totalPhysicalQuantity = tools.reduce((sum, t) => sum + t.quantity, 0);
  const activeIssues = issues.filter(log => log.status === "Issued");
  const totalIssuedCount = activeIssues.length;

  return (
    <div className="main-content">
      <div className="admin-header-badge">
        <h2>🛠️ Administrator Control Hub</h2>
        <p>Monitor global workshop operations, restock stock levels, and audit issue registrations.</p>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* 1. Statistics Cards Section */}
      <div className="stats-bar grid-3" style={{ marginBottom: "3rem" }}>
        <div className="stat-card glass-card">
          <div className="stat-icon">🔧</div>
          <div className="stat-details">
            <h3>{totalToolTypes}</h3>
            <p>Unique Tool Profiles</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon">📦</div>
          <div className="stat-details">
            <h3>{totalPhysicalQuantity}</h3>
            <p>Physical Stock Count</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon">📊</div>
          <div className="stat-details">
            <h3>{totalIssuedCount}</h3>
            <p>Active Issued Units</p>
          </div>
        </div>
      </div>

      <div className="admin-double-layout" style={{ marginBottom: "3rem" }}>
        {/* 2. Tool Room Addition Form */}
        <div className="glass-card tool-form-card">
          <h3 className="section-title">➕ Add New Workshop Tool</h3>
          <form onSubmit={handleAddToolSubmit} style={{ marginTop: "1rem" }}>
            <div className="form-group">
              <label htmlFor="name">Tool Title / Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                placeholder="e.g. Heavy Duty Claw Hammer"
                value={newTool.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="category">Tool Category *</label>
                <select
                  id="category"
                  name="category"
                  className="form-control"
                  value={newTool.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Screwdriver">Screwdriver</option>
                  <option value="Wrench">Wrench</option>
                  <option value="Plier">Plier</option>
                  <option value="Hammer">Hammer</option>
                  <option value="Saw">Saw</option>
                  <option value="Drill">Drill</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Stock Quantity *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  className="form-control"
                  placeholder="0"
                  min="0"
                  value={newTool.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tool Reference Image</label>
              <div className="file-upload-wrapper">
                {toolPreview ? (
                  <div>
                    <img src={toolPreview} alt="Tool Preview" className="file-upload-preview" />
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>Click to replace</p>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: "1.25rem" }}>📷</span>
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Upload PNG or JPG (Max 2MB)</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1rem" }}
            >
              🚀 Save Tool room Entry
            </button>
          </form>
        </div>

        {/* 3. Live Inventory Grid Display */}
        <div className="glass-card inventory-list-card">
          <h3 className="section-title">🏪 Active Store Inventory ({tools.length})</h3>
          <div className="inventory-scroll-container" style={{ marginTop: "1.5rem" }}>
            {tools.length === 0 ? (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "3rem" }}>
                No tools registered. Add a tool using the panel on the left.
              </p>
            ) : (
              <div className="inventory-mini-table">
                {tools.map(tool => (
                  <div key={tool._id} className="inventory-row">
                    <div className="inventory-row-left">
                      <div className="inv-img-wrap">
                        {tool.image ? (
                          <img src={tool.image} alt={tool.name} />
                        ) : (
                          <span>🛠️</span>
                        )}
                      </div>
                      <div className="inv-text-details">
                        <span className="inv-cat-tag">{tool.category}</span>
                        <strong className="inv-title">{tool.name}</strong>
                      </div>
                    </div>
                    <div className="inventory-row-right">
                      <span className="inv-qty-lbl">Available Stock:</span>
                      <strong className={`inv-qty-num ${tool.quantity === 0 ? "out" : ""}`}>
                        {tool.quantity}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Complete Issue Register logs */}
      <section className="dashboard-section">
        <h3 className="section-title" style={{ marginBottom: "1.25rem" }}>📋 Global Issue Register (Audit Log)</h3>
        {issues.length === 0 ? (
          <div className="glass-card empty-state">
            <p>No active or completed tool issue transactions recorded in the system.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Mechanic Info</th>
                  <th>Level</th>
                  <th>Tool Image</th>
                  <th>Tool Issued</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Issue Timestamp</th>
                  <th>Return Timestamp</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {issues.map(record => {
                  const mechanic = record.mechanicId;
                  const tool = record.toolId;
                  
                  return (
                    <tr key={record._id}>
                      {/* Mechanic Details */}
                      <td>
                        {mechanic ? (
                          <div className="table-mechanic-block">
                            <strong>{mechanic.name}</strong>
                            <div className="mech-meta-sub">
                              <span>📞 {mechanic.mobileNo}</span>
                              <span>✉️ {mechanic.email}</span>
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: "#ef4444" }}>Deleted Mechanic</span>
                        )}
                      </td>
                      
                      {/* Mechanic Level */}
                      <td>
                        {mechanic ? (
                          <span className={`status-badge-level ${mechanic.level.toLowerCase().replace(" ", "-")}`}>
                            {mechanic.level}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      
                      {/* Tool Image */}
                      <td>
                        <div className="table-img-wrapper">
                          {tool && tool.image ? (
                            <img src={tool.image} alt={tool.name} />
                          ) : (
                            <div className="table-img-placeholder">🛠️</div>
                          )}
                        </div>
                      </td>
                      
                      <td>
                        {tool ? (
                          <strong>{tool.name}</strong>
                        ) : (
                          <span style={{ color: "#ef4444" }}>Deleted Tool</span>
                        )}
                      </td>
                      
                      {/* Category */}
                      <td>{tool ? tool.category : "-"}</td>
                      
                      <td><strong>{record.quantity}</strong></td>
                      
                      <td>{new Date(record.issueDate).toLocaleString()}</td>
                      <td>{record.returnDate ? new Date(record.returnDate).toLocaleString() : "-"}</td>
                      
                      {/* Status */}
                      <td>
                        <span className={`status-pill ${record.status.toLowerCase()}`}>
                          {record.status}
                        </span>
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

export default AdminDashboard;
