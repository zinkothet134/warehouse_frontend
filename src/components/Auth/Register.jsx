import React, { useState } from "react";
import api from "../../libs/api";
import { Link } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "SALES", // Default role
    phone_number: "",
  });

  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear the specific field error when the user starts typing again
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);
    setIsSubmitting(true);

    try {
      await api.post("accounts/register/", formData);
      setMessage("Staff member successfully registered!");
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "SALES",
        phone_number: "",
      });
    } catch (err) {
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      } else {
        setErrors({
          non_field_errors: ["A network error occurred. Please try again."],
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <span style={styles.logoIcon}>👥</span>
          </div>
          <h2 style={styles.title}>Register Staff</h2>
          <p style={styles.subtitle}>Create a new account for your team</p>
        </div>

        {/* Success / General Error Banners */}
        {message && (
          <div style={styles.successBanner}>
            <span style={{ marginRight: "8px" }}>✅</span> {message}
          </div>
        )}
        {errors.non_field_errors && (
          <div style={styles.errorBanner}>
            <span style={{ marginRight: "8px" }}>⚠️</span>{" "}
            {errors.non_field_errors[0]}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              placeholder="e.g., john_sales"
              value={formData.username}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.username ? "#f87171" : "#cbd5e1",
              }}
              disabled={isSubmitting}
            />
            {errors.username && (
              <span style={styles.errorText}>{errors.username[0]}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.email ? "#f87171" : "#cbd5e1",
              }}
              disabled={isSubmitting}
            />
            {errors.email && (
              <span style={styles.errorText}>{errors.email[0]}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={{
                  ...styles.passwordInput,
                  borderColor: errors.password ? "#f87171" : "#cbd5e1",
                }}
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
            {errors.password && (
              <span style={styles.errorText}>{errors.password[0]}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="text"
              name="phone_number"
              placeholder="+95 9..."
              value={formData.phone_number}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.phone_number ? "#f87171" : "#cbd5e1",
              }}
              disabled={isSubmitting}
            />
            {errors.phone_number && (
              <span style={styles.errorText}>{errors.phone_number[0]}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>System Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.select}
              disabled={isSubmitting}
            >
              <option value="ADMIN">Admin</option>
              <option value="WAREHOUSE">Warehouse Staff</option>
              <option value="CASHIER">Cashier</option>
              <option value="SALES">Sales Staff</option>
            </select>
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
            {isSubmitting ? "Registering..." : "Register User"}
          </button>
        </form>

        {/* Footer Link */}
        <p style={styles.footerText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.footerLink}>
            Login here
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
    maxWidth: "460px",
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
    background: "#f0fdf4",
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
    gap: "18px",
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
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    color: "#0f172a",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s ease",
    background: "#fff",
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    color: "#0f172a",
    boxSizing: "border-box",
    outline: "none",
    background: "#fff",
    cursor: "pointer",
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  passwordInput: {
    width: "100%",
    padding: "12px 70px 12px 16px",
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
  errorText: {
    color: "#ef4444",
    fontSize: "13px",
    fontWeight: 500,
    marginTop: "2px",
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 600,
    marginTop: "12px",
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
