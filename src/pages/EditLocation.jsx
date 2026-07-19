import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../libs/api";

export default function EditLocation() {
  const navigate = useNavigate();
  const { id } = useParams(); // Extract the location ID from the URL

  const [formData, setFormData] = useState({
    name: "",
    zone: "",
    address: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch existing location data when the component mounts
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await api.get(`inventory/locations/${id}/`);
        setFormData({
          name: response.data.name || "",
          zone: response.data.zone || "",
          address: response.data.address || "",
          is_active: response.data.is_active,
        });
      } catch (err) {
        console.error("Error fetching location:", err);
        setError("Failed to load location details. It may have been deleted.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [id]);

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

      // Use PUT (or PATCH) to update the existing resource
      await api.put(`inventory/locations/${id}/`, formData);

      // Navigate back to the location list on success
      navigate("/inventory/locations");
    } catch (err) {
      console.error("Error updating location:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to update location. Please check your inputs.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={styles.center}>Loading location details...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Edit Warehouse Location</h1>
          <p style={styles.subtitle}>
            Update details or change the status of this storage zone.
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
                value={formData.zone}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <label style={styles.label}>Physical Address</label>
            <textarea
              name="address"
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
            {submitting ? "Updating..." : "Update Location"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Reusing the exact same styles from AddLocation for UI consistency
const styles = {
  page: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "32px 24px",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  center: { textAlign: "center", padding: "60px", color: "#64748b" },
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
