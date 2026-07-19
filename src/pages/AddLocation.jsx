import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/api";

export default function AddLocation() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    zone: "",
    address: "",
    is_active: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      // Assuming your backend route is /api/inventory/locations/
      await api.post("inventory/locations/", formData);

      // Navigate back to the location list or main inventory page
      navigate("/inventory/locations");
    } catch (err) {
      console.error("Error saving location:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to create location. Please check your inputs.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Add Warehouse Location</h1>
          <p style={styles.subtitle}>
            Define new storage facilities or zones for inventory tracking.
          </p>
        </div>
      </div>

      {error && <div style={styles.errorCard}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit} style={styles.formCard}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Location Details</h3>

          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Location Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Main Warehouse, Storefront"
                value={formData.name}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Zone / Region</label>
              <input
                type="text"
                name="zone"
                placeholder="e.g., Aisle 4, North District"
                value={formData.zone}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <label style={styles.label}>Physical Address (Optional)</label>
            <textarea
              name="address"
              placeholder="Full street address..."
              value={formData.address}
              onChange={handleChange}
              rows={3}
              style={{ ...styles.input, resize: "vertical" }}
            />
          </div>

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label
              htmlFor="is_active"
              style={{ ...styles.label, marginBottom: 0, cursor: "pointer" }}
            >
              Active Location (Available for receiving stock)
            </label>
          </div>
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            onClick={() => navigate("/inventory/locations")}
            style={styles.cancelBtn}
          >
            Cancel
          </button>
          <button type="submit" disabled={submitting} style={styles.submitBtn}>
            {submitting ? "Saving..." : "Save Location"}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "32px 24px",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: { marginBottom: "32px" },
  pageTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  subtitle: { color: "#64748b", marginTop: "6px", fontSize: "15px" },
  formCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,.05)",
    border: "1px solid #e2e8f0",
  },
  errorCard: {
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "14px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontWeight: "500",
    border: "1px solid #f87171",
  },
  section: { marginBottom: "28px" },
  sectionTitle: {
    marginBottom: "16px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "16px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#475569",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
    fontSize: "14px",
    color: "#334155",
    outline: "none",
    background: "#ffffff",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "20px",
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "500",
    color: "#64748b",
    fontSize: "14px",
  },
  submitBtn: {
    padding: "10px 24px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
};
