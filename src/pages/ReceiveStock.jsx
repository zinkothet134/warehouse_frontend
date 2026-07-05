import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/api";

export default function ReceiveStock() {
  const navigate = useNavigate();

  const [variants, setVariants] = useState([]);
  const [locations, setLocations] = useState([]);

  const [formData, setFormData] = useState({
    variant: "",
    location: "",
    quantity_on_hand: "",
    low_stock_threshold: 5,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [variantsRes, locationsRes] = await Promise.all([
          api.get("products/variants/?page_size=100"),
          api.get("inventory/locations/"),
        ]);

        // CRITICAL FIX: Extract the .results array from the paginated response!
        setVariants(variantsRes.data.results || variantsRes.data);
        setLocations(locationsRes.data.results || locationsRes.data);
      } catch (err) {
        setError("Failed to load data for the form.");
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const selectedVariant = variants.find(
    (v) => String(v.id) === String(formData.variant),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      await api.post("inventory/levels/", formData);

      navigate("/inventory/levels");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save stock.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={styles.center}>Loading inventory form...</div>;
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Receive New Shipment</h1>

          <p style={styles.subtitle}>Add inventory into warehouse stock</p>
        </div>
      </div>

      {/* ERROR */}

      {error && <div style={styles.errorCard}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit} style={styles.formCard}>
        {/* SKU */}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Product Information</h3>

          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Product Variant</label>

              <select
                name="variant"
                value={formData.variant}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Select SKU</option>

                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.product_name || v.product?.name || "Product"} — {v.sku} -{" "}
                    {v.color} ( Size {v.size})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>Warehouse Location</label>

              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Select Location</option>

                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                    {loc.zone ? ` (${loc.zone})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SKU Preview */}

          {selectedVariant && (
            <div style={styles.previewCard}>
              {/* 👇 Added Product Name as the bold title of the preview card */}
              <div style={styles.previewTitle}>
                {selectedVariant.product_name ||
                  selectedVariant.product?.name ||
                  "Unknown Product"}
              </div>
              <div style={styles.previewSku}>{selectedVariant.sku}</div>

              <div>Color: {selectedVariant.color || "N/A"}</div>

              <div>Size: {selectedVariant.size || "N/A"}</div>
            </div>
          )}
        </div>

        {/* STOCK */}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Stock Information</h3>

          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Quantity Received</label>

              <input
                type="number"
                min="1"
                name="quantity_on_hand"
                value={formData.quantity_on_hand}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Low Stock Alert</label>

              <input
                type="number"
                min="0"
                name="low_stock_threshold"
                value={formData.low_stock_threshold}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* ACTIONS */}

        <div style={styles.actions}>
          <button
            type="button"
            onClick={() => navigate("/inventory/levels")}
            style={styles.cancelBtn}
          >
            Cancel
          </button>

          <button type="submit" disabled={submitting} style={styles.submitBtn}>
            {submitting ? "Saving..." : "Save Stock"}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "24px",
    background: "#f8fafc",
    minHeight: "100vh",
  },

  center: {
    textAlign: "center",
    padding: "60px",
  },

  header: {
    marginBottom: "24px",
  },

  pageTitle: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 700,
  },

  subtitle: {
    color: "#64748b",
    marginTop: "6px",
  },

  formCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,.08)",
  },

  errorCard: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "14px",
    borderRadius: "12px",
    marginBottom: "16px",
    fontWeight: "600",
  },

  section: {
    marginBottom: "28px",
  },

  sectionTitle: {
    marginBottom: "16px",
    fontSize: "18px",
    fontWeight: "600",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "16px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "500",
    color: "#334155",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
    fontSize: "14px",
  },

  previewCard: {
    marginTop: "16px",
    padding: "16px",
    background: "#eff6ff",
    borderRadius: "12px",
    border: "1px solid #bfdbfe",
  },
  // 👇 ADD THIS NEW STYLE
  previewTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "4px",
  },

  previewSku: {
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: "8px",
  },

  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "20px",
  },

  cancelBtn: {
    flex: 1,
    minWidth: "140px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    color: "red",
  },

  submitBtn: {
    flex: 2,
    minWidth: "200px",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
};
