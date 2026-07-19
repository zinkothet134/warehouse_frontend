import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../libs/api";

export default function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("accounts/password-reset/", { email });
      setMessage(
        response.data.success || "Check your email for the reset link.",
      );

      // Navigate to the next step, passing the email via state
      navigate("/reset-password", { state: { email: email } });
      setEmail("");
    } catch (err) {
      setError("Failed to send reset email. Make sure the email is correct.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <span style={styles.logoIcon}>✉️</span>
          </div>
          <h2 style={styles.title}>Reset Password</h2>
          <p style={styles.subtitle}>
            Enter your email address and we will send you a 6-digit reset code.
          </p>
        </div>

        {/* Status Banners */}
        {message && (
          <div style={styles.successBanner}>
            <span style={{ marginRight: "8px" }}>✅</span> {message}
          </div>
        )}
        {error && (
          <div style={styles.errorBanner}>
            <span style={{ marginRight: "8px" }}>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              background: isLoading ? "#93c5fd" : "#2563eb",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
            disabled={isLoading}
          >
            {isLoading ? "Sending Code..." : "Send Reset Code"}
          </button>
        </form>

        {/* Footer Link */}
        <p style={styles.footerText}>
          Remember your password?{" "}
          <Link to="/login" style={styles.footerLink}>
            Back to Login
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
    background: "#f8fafc",
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
    lineHeight: "1.5",
  },
  successBanner: {
    display: "flex",
    alignItems: "center",
    background: "#f0fdf4",
    color: "#166534",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "24px",
    fontSize: "14px",
    fontWeight: 500,
    border: "1px solid #bbf7d0",
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
