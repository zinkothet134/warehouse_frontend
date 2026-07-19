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

  const selectedVariant = Array.isArray(variants)
    ? variants.find((v) => String(v.id) === String(formData.variant))
    : "";

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
                {!Array.isArray(variants) || variants.length === 0 ? (
                  <option value="" disabled>
                    No variants available.
                  </option>
                ) : (
                  variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.product_name || v.product?.name || "Product"} — {v.sku}
                    </option>
                  ))
                )}
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
                {!Array.isArray(locations) || locations.length === 0 ? (
                  <option value="" disabled>
                    No locations available.
                  </option>
                ) : (
                  locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                      {loc.zone ? ` (${loc.zone})` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* SKU Preview */}
          {selectedVariant && (
            <div style={styles.previewCard}>
              <div style={styles.previewTitle}>
                {selectedVariant.product_name ||
                  selectedVariant.product?.name ||
                  "Unknown Product"}
              </div>
              <div style={styles.previewSku}>{selectedVariant.sku}</div>

              {/* Dynamic Attribute Display */}
              <div style={styles.attributeContainer}>
                {selectedVariant.attribute_values &&
                Array.isArray(selectedVariant.attribute_values) ? (
                  selectedVariant.attribute_values.map((attr, index) => {
                    // Fallbacks in case the DRF serializer names the fields slightly differently
                    const attrName =
                      attr.attribute?.name ||
                      attr.attribute_name ||
                      "Attribute";
                    const valName = attr.value || attr.value_name || "Unknown";

                    return (
                      <span key={index} style={styles.attributeBadge}>
                        <strong>{attrName}:</strong> {valName}
                      </span>
                    );
                  })
                ) : (
                  <span style={{ fontSize: "13px", color: "#64748b" }}>
                    See SKU for variant details
                  </span>
                )}
              </div>
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
    padding: "32px 24px",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  center: {
    textAlign: "center",
    padding: "60px",
    color: "#64748b",
  },
  header: {
    marginBottom: "32px",
  },
  pageTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#64748b",
    marginTop: "6px",
    fontSize: "15px",
  },
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
  section: {
    marginBottom: "28px",
  },
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
  previewCard: {
    marginTop: "16px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  previewTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "4px",
  },
  previewSku: {
    fontFamily: "monospace",
    fontWeight: "600",
    color: "#3b82f6",
    marginBottom: "12px",
    fontSize: "14px",
  },
  attributeContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  attributeBadge: {
    background: "#e2e8f0",
    color: "#334155",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "13px",
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
