import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../../libs/api";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await api.post("accounts/login/", credentials);

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      const decodedToken = jwtDecode(response.data.access);
      console.log(
        "Logged in as:",
        decodedToken.username,
        "Role:",
        decodedToken.role,
      );

      setFailedAttempts(0);

      // Using window.location.href ensures a full hard-reload so any
      // global state or API interceptors pick up the new token immediately.
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Invalid username or password.");
      setFailedAttempts((prev) => prev + 1);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Branding / Header Section */}
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <span style={styles.logoIcon}>📦</span>
          </div>
          <h2 style={styles.title}>System Login</h2>
          <p style={styles.subtitle}>
            Enter your credentials to access the portal
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={styles.errorBanner}>
            <span style={{ marginRight: "8px" }}>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              placeholder="e.g., admin_user"
              value={credentials.username}
              onChange={handleChange}
              required
              style={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={handleChange}
                required
                style={styles.passwordInput}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                tabIndex="-1"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              background: isSubmitting ? "#93c5fd" : "#2563eb",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Recovery Help */}
        {failedAttempts > 1 && (
          <div style={styles.recoveryBox}>
            <p style={styles.recoveryText}>Having trouble logging in?</p>
            <Link to="/forgot-password" style={styles.recoveryLink}>
              Click here to reset your password
            </Link>
          </div>
        )}

        {/* Footer Link */}
        <p style={styles.footerText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.footerLink}>
            Register Staff
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  page: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f8fafc", // Soft gray-blue background
    padding: "20px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "40px 32px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
    border: "1px solid #e2e8f0",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  logoCircle: {
    width: "56px",
    height: "56px",
    background: "#eff6ff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px auto",
  },
  logoIcon: {
    fontSize: "24px",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "24px",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "15px",
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "24px",
    fontSize: "14px",
    fontWeight: 500,
    border: "1px solid #fecaca",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#334155",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    color: "#0f172a",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s ease",
    background: "#fff",
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  passwordInput: {
    width: "100%",
    padding: "14px 70px 14px 16px", // Extra padding on right for the button
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    color: "#0f172a",
    boxSizing: "border-box",
    outline: "none",
    background: "#fff",
  },
  eyeButton: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    padding: "4px 8px",
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 600,
    marginTop: "8px",
    transition: "background 0.2s ease",
  },
  recoveryBox: {
    marginTop: "24px",
    padding: "16px",
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    textAlign: "center",
  },
  recoveryText: {
    margin: "0 0 8px 0",
    color: "#92400e",
    fontSize: "14px",
    fontWeight: 500,
  },
  recoveryLink: {
    color: "#d97706",
    fontWeight: 600,
    textDecoration: "none",
    fontSize: "14px",
  },
  footerText: {
    textAlign: "center",
    marginTop: "32px",
    color: "#64748b",
    fontSize: "14px",
  },
  footerLink: {
    color: "#2563eb",
    fontWeight: 600,
    textDecoration: "none",
  },
};
