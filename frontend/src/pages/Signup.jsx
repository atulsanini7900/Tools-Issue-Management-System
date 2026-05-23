import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import { API_BASE_URL } from "../config";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNo: "",
    password: "",
    level: "Trainee",
    picture: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  // Live password checks
  const hasMinLength = formData.password.length >= 6;
  const hasLetterAndNumber = /^(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password);
  const hasSpecialChar = /[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-]/.test(formData.password);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        picture: reader.result
      }));
      setPreviewUrl(reader.result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { name, email, mobileNo, password, level, picture } = formData;

    if (!name || !email || !mobileNo || !password || !level) {
      setError("Please fill out all required fields.");
      return;
    }

    // Email check
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setError("Please provide a valid email address.");
      return;
    }

    // Mobile Number Check: Exactly 10 digits
    if (!/^\d{10}$/.test(mobileNo)) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }

    // Password Checks
    if (!hasMinLength || !hasLetterAndNumber || !hasSpecialChar) {
      setError("Password must be alphanumeric (at least 1 letter, 1 number) and include a special character.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          mobileNo,
          password,
          level,
          picture
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      setSuccess("Account successfully created! Redirecting to login...");
      setFormData({
        name: "",
        email: "",
        mobileNo: "",
        password: "",
        level: "Trainee",
        picture: ""
      });
      setPreviewUrl("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>Join as Mechanic</h2>
        <p>Register to view inventory, issue tools, and request restocks.</p>
      </div>

      <div className="glass-card">
        {error && <div className="alert alert-danger">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="mobileNo">Mobile Number (10 Digits) *</label>
              <input
                type="tel"
                id="mobileNo"
                name="mobileNo"
                className="form-control"
                placeholder="e.g. 9876543210"
                value={formData.mobileNo}
                onChange={handleInputChange}
                required
              />
              <div className="validation-helper">
                {formData.mobileNo && (
                  <span className={/^\d{10}$/.test(formData.mobileNo) ? "valid" : "invalid"}>
                    {/^\d{10}$/.test(formData.mobileNo) ? "✓ Correct 10-digit number" : "✗ Must be exactly 10 digits"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="level">Level of Mechanic *</label>
              <select
                id="level"
                name="level"
                className="form-control"
                value={formData.level}
                onChange={handleInputChange}
                required
              >
                <option value="Expert">Expert</option>
                <option value="Medium">Medium</option>
                <option value="New Recruit">New Recruit</option>
                <option value="Trainee">Trainee</option>
              </select>
            </div>

            <div className="form-group">
              <label>Profile Picture (Optional)</label>
              <div className="file-upload-wrapper">
                {previewUrl ? (
                  <div>
                    <img src={previewUrl} alt="Avatar Preview" className="file-upload-preview" />
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>Click to replace</p>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: "1.25rem" }}>📷</span>
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Upload image (Max 2MB)</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            {formData.password && (
              <div className="password-checker">
                <p className="checker-title">Password strength requirements:</p>
                <div className="checker-item">
                  <span className={hasMinLength ? "check valid" : "check invalid"}>{hasMinLength ? "✓" : "✗"}</span>
                  <span>Minimum 6 characters</span>
                </div>
                <div className="checker-item">
                  <span className={hasLetterAndNumber ? "check valid" : "check invalid"}>{hasLetterAndNumber ? "✓" : "✗"}</span>
                  <span>Alphanumeric (has letters & numbers)</span>
                </div>
                <div className="checker-item">
                  <span className={hasSpecialChar ? "check valid" : "check invalid"}>{hasSpecialChar ? "✓" : "✗"}</span>
                  <span>Contains a special character (e.g. @, #, !)</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "1rem" }}
            disabled={loading}
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>
      </div>

      <p className="auth-switch">
        Already registered? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Signup;
