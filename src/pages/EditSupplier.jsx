import { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "../libs/api";
import SupplierForm from "../components/purchasing/SupplierForm"; // Import our reusable form

export default function EditSupplierModal({ supplier, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Close modal when pressing the Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [loading, onClose]);

  if (!supplier) return null;

  const handleUpdate = async (formData) => {
    try {
      setLoading(true);
      setError("");

      // PATCH request to update the specific supplier
      const response = await api.patch(
        `/purchasing/suppliers/${supplier.id}/`,
        formData,
      );

      // Pass the updated data back to the parent to update the UI instantly
      onSuccess?.();
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        const errorMsg =
          data.email?.[0] ||
          data.name?.[0] ||
          data.detail ||
          "Failed to update supplier.";
        setError(errorMsg);
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={!loading ? onClose : undefined}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} disabled={loading} style={styles.closeButton}>
          <X size={18} />
        </button>

        <div style={styles.header}>
          <h2 style={styles.title}>Edit Supplier</h2>
          <p style={styles.subtitle}>Update details for {supplier.name}</p>
        </div>

        {/* Drop in the reusable form! */}
        <div style={styles.formContainer}>
          <SupplierForm
            initialData={supplier}
            onSubmit={handleUpdate}
            isLoading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(15,23,42,0.55)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  },
  modal: {
    width: "100%",
    maxWidth: "700px", // Made slightly wider for the form layout
    background: "#fff",
    borderRadius: "20px",
    position: "relative",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
  },
  closeButton: {
    position: "absolute",
    right: "16px",
    top: "16px",
    border: "none",
    background: "#f8fafc",
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  header: {
    padding: "24px 24px 0 24px",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 700,
    color: "#0f172a",
  },
  subtitle: {
    margin: "6px 0 0 0",
    color: "#64748b",
    fontSize: "14px",
  },
  formContainer: {
    overflowY: "auto", // Allows scrolling if the screen is small
    paddingBottom: "8px",
  },
};
