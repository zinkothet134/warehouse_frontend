import { useState, useEffect } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import api from "../libs/api";

export default function DeleteSupplierModal({ supplier, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [loading, onClose]);

  if (!supplier) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");

      await api.delete(`/purchasing/suppliers/${supplier.id}/`);

      onSuccess?.();
      onClose?.();
    } catch (err) {
      const data = err.response?.data;

      if (data?.detail) {
        setError(data.detail);
      } else if (data?.non_field_errors?.length) {
        setError(data.non_field_errors[0]);
      } else {
        setError("Unable to delete supplier. Please try again.");
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

        <div style={styles.iconWrapper}>
          <AlertTriangle size={32} color="#dc2626" />
        </div>

        <h2 style={styles.title}>Delete Supplier</h2>

        <p style={styles.description}>
          This will permanently delete
          <strong> {supplier.name}</strong>.
        </p>

        <p style={styles.warning}>This action cannot be undone.</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.footer}>
          <button
            onClick={onClose}
            disabled={loading}
            style={styles.cancelButton}
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            style={{
              ...styles.deleteButton,
              opacity: loading ? 0.8 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                  style={{ marginRight: 8 }}
                />
                Deleting...
              </>
            ) : (
              "Delete Supplier"
            )}
          </button>
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
    maxWidth: "440px",
    background: "#fff",
    borderRadius: "20px",
    padding: "28px",
    position: "relative",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)",
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
  },

  iconWrapper: {
    width: "72px",
    height: "72px",
    margin: "0 auto",
    borderRadius: "50%",
    background: "#fee2e2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    marginTop: "20px",
    marginBottom: "10px",
    textAlign: "center",
    fontSize: "24px",
    fontWeight: 700,
    color: "#0f172a",
  },

  description: {
    textAlign: "center",
    color: "#475569",
    marginBottom: "6px",
    lineHeight: 1.6,
  },

  warning: {
    textAlign: "center",
    color: "#dc2626",
    fontWeight: 600,
    marginBottom: "20px",
  },

  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "18px",
    fontSize: "14px",
  },

  footer: {
    display: "flex",
    gap: "12px",
  },

  cancelButton: {
    flex: 1,
    height: "48px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    fontWeight: 600,
    cursor: "pointer",
  },

  deleteButton: {
    flex: 1,
    height: "48px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg,#dc2626,#ef4444)",
    color: "#fff",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
