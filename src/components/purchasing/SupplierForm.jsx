// SupplierForm.jsx
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function SupplierForm({
  initialData = {},
  onSubmit,
  isLoading,
  error,
  success,
}) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    address: initialData.address || "",
    contact_name: initialData.contact_name || "",
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        contact_name: initialData.contact_name || "",
      });
    }
  }, [initialData]);

  // Clear the form automatically on successful creation
  useEffect(() => {
    if (success && !initialData.id) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        contact_name: "",
      });
    }
  }, [success, initialData.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Passes the data back up to the parent page
  };
  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* ... your input fields go here ... */}
      {error && <div style={styles.errorMessage}>{error}</div>}
      {success && <div style={styles.successMessage}>{success}</div>}

      <div style={styles.inputGroup}>
        <div style={styles.row}>
          <div style={styles.inputWrapper}>
            <label style={styles.label}>Company/Shop Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="Nike Wholesale"
            />
          </div>

          <div style={styles.inputWrapper}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              // required
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="vendor@company.com"
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.inputWrapper}>
            <label style={styles.label}>Contact Person *</label>
            <input
              type="text"
              name="contact_name"
              required
              value={formData.contact_name}
              onChange={handleChange}
              style={styles.input}
              placeholder="John Smith"
            />
          </div>

          <div style={styles.inputWrapper}>
            <label style={styles.label}>Phone Number *</label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              placeholder="+66 123 456 789"
            />
          </div>
        </div>

        <div style={styles.inputWrapper}>
          <label style={styles.label}>Address</label>
          <textarea
            name="address"
            rows={3}
            value={formData.address}
            onChange={handleChange}
            style={{
              ...styles.input,
              resize: "vertical",
            }}
            placeholder="Supplier address"
          />
        </div>
      </div>

      <div style={styles.footer}>
        <button type="submit" disabled={isLoading} style={styles.submitButton}>
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : initialData.id ? (
            "Update Supplier"
          ) : (
            "Save Supplier"
          )}
        </button>
      </div>
    </form>
  );
}

const styles = {
  form: {
    padding: "24px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  row: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  inputWrapper: {
    flex: 1,
    minWidth: "250px",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "6px",
    fontWeight: 500,
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  footer: {
    marginTop: "24px",
    display: "flex",
    justifyContent: "flex-end",
  },
  submitButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    minWidth: "140px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  errorMessage: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    color: "#dc2626",
  },
  successMessage: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#ecfdf5",
    border: "1px solid #a7f3d0",
    borderRadius: "8px",
    color: "#059669",
  },
};
