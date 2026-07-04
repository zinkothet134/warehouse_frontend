import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import api from "../libs/api";

export default function EditProduct() {
  const { id } = useParams(); // Grabs the ID from the URL (/products/edit/6)
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    // We will store the IDs for the foreign keys
    brand: "",
    category: "",
  });

  // Dropdown options
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      // Fetch the specific product AND the dropdown options simultaneously
      const [productRes, brandsRes, categoriesRes] = await Promise.all([
        api.get(`products/catalog/${id}/`),
        api.get("products/brands/"),
        api.get("products/categories/"),
      ]);

      const product = productRes.data;

      setFormData({
        name: product.name || "",
        description: product.description || "",
        brand: product.brand || "", // Assuming the API returns the Brand ID
        category: product.category || "", // Assuming the API returns the Category ID
      });

      setBrands(brandsRes.data.results || brandsRes.data);
      setCategories(categoriesRes.data.results || categoriesRes.data);
    } catch (err) {
      setError("Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.patch(`products/catalog/${id}/`, formData);
      navigate("/products"); // Go back to the catalog on success!
    } catch (err) {
      setError("Failed to save product changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.centerText}>Loading product...</div>;

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => navigate("/products")} style={styles.backBtn}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={styles.title}>Edit Product</h1>
            <p style={styles.subtitle}>Update master product details</p>
          </div>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* FORM */}
      <div style={styles.card}>
        <form onSubmit={handleSave} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Product Name</label>
            <input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Brand</label>
              <select
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                style={styles.input}
              >
                <option value="">Select a Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                style={styles.input}
              >
                <option value="">Select a Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              style={{ ...styles.input, resize: "vertical" }}
            />
          </div>

          <div style={styles.footer}>
            <button type="submit" disabled={saving} style={styles.saveBtn}>
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "32px",
    background: "#f8fafc",
    minHeight: "100vh",
    maxWidth: "800px",
    margin: "0 auto",
  },
  centerText: { padding: "50px", textAlign: "center", color: "#64748b" },
  header: { marginBottom: "28px" },
  backBtn: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    color: "#475569",
    display: "flex",
  },
  title: { margin: 0, fontSize: "28px", fontWeight: "800", color: "#0f172a" },
  subtitle: { marginTop: "6px", color: "#64748b", fontSize: "15px" },
  errorBox: {
    margin: "0 0 20px 0",
    color: "#dc2626",
    background: "#fef2f2",
    padding: "16px",
    border: "1px solid #fecaca",
    borderRadius: "10px",
  },
  card: {
    background: "#fff",
    padding: "32px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
  },
  form: { display: "flex", flexDirection: "column", gap: "24px" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#475569" },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    color: "#fff",
    outline: "none",
    boxSizing: "border-box",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "12px",
    paddingTop: "24px",
    borderTop: "1px solid #e2e8f0",
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
  },
};
