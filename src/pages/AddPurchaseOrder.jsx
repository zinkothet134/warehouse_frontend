import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../libs/api";

export default function AddPurchaseOrder() {
  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dropdown Data
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  // Form State
  const [poDetails, setPoDetails] = useState({
    supplier: "",
    expected_delivery: "",
    notes: "",
    status: "DRAFT",
  });

  const [items, setItems] = useState([
    { product_variant: "", quantity: 1, unit_cost: "" },
  ]);

  // 1. Fetch dropdown data on mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [supplierRes, productRes] = await Promise.all([
          api.get("/purchasing/suppliers/"),
          // UPDATE THIS URL if your products API path is different!
          api.get("/products/variants/"),
        ]);

        // Handle DRF pagination (.results) if present
        setSuppliers(supplierRes.data.results || supplierRes.data);
        setProducts(productRes.data.results || productRes.data);
      } catch (err) {
        alert("Error loading suppliers or products");
      } finally {
        setLoadingData(false);
      }
    };
    fetchDropdownData();
  }, []);

  // 2. Handlers for Parent Details
  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setPoDetails((prev) => ({ ...prev, [name]: value }));
  };

  // 3. Handlers for Dynamic Items
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { product_variant: "", quantity: 1, unit_cost: "" }]);
  };

  const removeItemRow = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // 4. Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!poDetails.supplier) return alert("Please select a supplier");

    // Validate items
    const isValid = items.every(
      (item) => item.product_variant && item.quantity > 0 && item.unit_cost,
    );
    if (!isValid)
      return alert("Please fill out all product details correctly.");

    setSaving(true);
    try {
      const payload = {
        ...poDetails,
        items: items,
      };

      await api.post("/purchasing/purchase-orders/", payload);
      navigate("/purchasing/purchase-orders");
    } catch (err) {
      alert("Failed to create order. Please check the console.");
      console.error(err.response?.data || err);
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) return <div style={styles.page}>Loading form data...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create Purchase Order</h2>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* PARENT DETAILS */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Order Details</h3>
            <div style={styles.grid}>
              <div style={styles.inputWrapper}>
                <label style={styles.label}>Supplier *</label>
                <select
                  name="supplier"
                  value={poDetails.supplier}
                  onChange={handleDetailChange}
                  style={styles.input}
                  required
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputWrapper}>
                <label style={styles.label}>Expected Delivery</label>
                <input
                  type="date"
                  name="expected_delivery"
                  value={poDetails.expected_delivery}
                  onChange={handleDetailChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputWrapper}>
                <label style={styles.label}>Status</label>
                <select
                  name="status"
                  value={poDetails.status}
                  onChange={handleDetailChange}
                  style={styles.input}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ORDERED">Ordered</option>
                </select>
              </div>
            </div>

            <div style={styles.inputWrapper}>
              <label style={styles.label}>Notes</label>
              <textarea
                name="notes"
                rows={2}
                value={poDetails.notes}
                onChange={handleDetailChange}
                style={styles.input}
              />
            </div>
          </div>

          <hr style={styles.divider} />

          {/* LINE ITEMS */}
          <div style={styles.section}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={styles.sectionTitle}>Line Items *</h3>
              <button type="button" onClick={addItemRow} style={styles.addBtn}>
                <Plus size={16} /> Add Row
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <div style={{ ...styles.inputWrapper, flex: 3 }}>
                  <label style={styles.label}>Product Variant</label>
                  <select
                    value={item.product_variant}
                    onChange={(e) =>
                      handleItemChange(index, "product_variant", e.target.value)
                    }
                    style={styles.input}
                    required
                  >
                    <option value="">Select a product...</option>
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.sku || `Product #${prod.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ ...styles.inputWrapper, flex: 1 }}>
                  <label style={styles.label}>Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    style={styles.input}
                    required
                  />
                </div>

                <div style={{ ...styles.inputWrapper, flex: 1 }}>
                  <label style={styles.label}>Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unit_cost}
                    onChange={(e) =>
                      handleItemChange(index, "unit_cost", e.target.value)
                    }
                    style={styles.input}
                    required
                  />
                </div>

                <div style={{ paddingTop: "28px" }}>
                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    style={{
                      ...styles.deleteBtn,
                      opacity: items.length === 1 ? 0.5 : 1,
                    }}
                    disabled={items.length === 1}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div style={styles.footer}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} style={styles.submitBtn}>
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Save Order"
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
    padding: "24px",
    background: "#f8fafc",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: "900px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  },
  header: { padding: "24px", borderBottom: "1px solid #e5e7eb" },
  title: { margin: 0, fontSize: "24px", fontWeight: "700" },
  form: { padding: "24px" },
  section: { display: "flex", flexDirection: "column", gap: "16px" },
  sectionTitle: { margin: 0, fontSize: "18px", color: "#1e293b" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  inputWrapper: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "14px", fontWeight: "500", color: "#475569" },
  input: {
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
  },
  divider: { border: "none", borderTop: "1px solid #e5e7eb", margin: "32px 0" },
  itemRow: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    background: "#f8fafc",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#eff6ff",
    color: "#2563eb",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#dc2626",
    cursor: "pointer",
    padding: "8px",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #e5e7eb",
  },
  cancelBtn: {
    padding: "10px 20px",
    background: "#fff",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
