import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../libs/api";

export default function PasswordResetConfirm() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Grab the email that was passed from the previous screen
  const userEmail = location.state?.email || "";

  // 2. Manage the multi-step flow
  const [step, setStep] = useState(1); // Step 1: OTP, Step 2: Password
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Safety check: if someone visits this page without going through the request flow
  if (!userEmail) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={{ ...styles.logoCircle, background: "#fef2f2" }}>
              <span style={styles.logoIcon}>⚠️</span>
            </div>
            <h2 style={styles.title}>Missing Information</h2>
            <p style={styles.subtitle}>We don't know which account to reset.</p>
          </div>
          <Link to="/forgot-password" style={styles.primaryLinkBtn}>
            Click here to start over
          </Link>
        </div>
      </div>
    );
  }

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      setStep(2);
      setError(null);
    } else {
      setError("Please enter a valid 6-digit code.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      await api.post("accounts/password-reset-confirm/", {
        email: userEmail,
        otp: otp,
        password: password,
      });

      setMessage("Password reset successfully!");
      setPassword("");
      alert("Password reset successfully! You can now log in.");
      navigate("/login");
    } catch (err) {
      // If Django rejects the OTP (e.g., expired or wrong), send them back to Step 1
      setError("This code is invalid or has expired. Please try again.");
      setStep(1);
      setOtp("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* STEP 1: ENTER OTP */}
        {step === 1 && (
          <>
            <div style={styles.header}>
              <div style={styles.logoCircle}>
                <span style={styles.logoIcon}>📩</span>
              </div>
              <h2 style={styles.title}>Check Your Email</h2>
              <p style={styles.subtitle}>
                We sent a 6-digit code to{" "}
                <strong style={{ color: "#0f172a" }}>{userEmail}</strong>.
              </p>
            </div>

            {error && (
              <div style={styles.errorBanner}>
                <span style={{ marginRight: "8px" }}>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleOtpSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="••••••"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  style={styles.otpInput}
                  disabled={isSubmitting}
                />
              </div>

              <button type="submit" style={styles.submitBtn}>
                Verify Code
              </button>
            </form>
          </>
        )}

        {/* STEP 2: ENTER NEW PASSWORD */}
        {step === 2 && (
          <>
            <div style={styles.header}>
              <div style={{ ...styles.logoCircle, background: "#f0fdf4" }}>
                <span style={styles.logoIcon}>🔐</span>
              </div>
              <h2 style={styles.title}>Create New Password</h2>
              <p style={styles.subtitle}>
                Almost done! Choose a new secure password.
              </p>
            </div>

            {error && (
              <div style={styles.errorBanner}>
                <span style={{ marginRight: "8px" }}>⚠️</span> {error}
              </div>
            )}
            {message && (
              <div style={styles.successBanner}>
                <span style={{ marginRight: "8px" }}>✅</span> {message}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>New Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    minLength="8"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  background: isSubmitting ? "#6ee7b7" : "#10b981",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save New Password"}
              </button>
            </form>

            <button
              onClick={() => setStep(1)}
              style={styles.backBtn}
              disabled={isSubmitting}
            >
              Wait, I need to fix my code
            </button>
          </>
        )}
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
  otpInput: {
    width: "100%",
    padding: "16px",
    borderRadius: "10px",
    border: "2px solid #cbd5e1",
    fontSize: "28px",
    letterSpacing: "8px",
    textAlign: "center",
    color: "#0f172a",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s ease",
    background: "#fff",
    fontWeight: 700,
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  passwordInput: {
    width: "100%",
    padding: "14px 70px 14px 16px",
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
    background: "#2563eb",
    cursor: "pointer",
  },
  primaryLinkBtn: {
    display: "block",
    textAlign: "center",
    width: "100%",
    padding: "14px",
    background: "#2563eb",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 600,
    boxSizing: "border-box",
  },
  backBtn: {
    width: "100%",
    marginTop: "16px",
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    textDecoration: "underline",
    padding: "8px",
  },
};
