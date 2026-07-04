import React from "react";
import { X, AlertTriangle } from "lucide-react";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = "item",
  loading = false,
  error = null,
}) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} disabled={loading} style={styles.closeButton}>
          <X size={20} color="#64748b" />
        </button>

        <div style={styles.iconWrapper}>
          <AlertTriangle size={28} color="#dc2626" />
        </div>

        <h2 style={styles.title}>Delete {itemType}</h2>

        <p style={styles.description}>
          This will permanently delete
          <strong style={{ color: "#0f172a" }}> {itemName}</strong>.
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
            onClick={onConfirm}
            disabled={loading}
            style={styles.deleteButton}
          >
            {loading ? "Deleting..." : "Delete"}
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
    background: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#fff",
    width: "100%",
    maxWidth: "400px",
    borderRadius: "16px",
    padding: "32px 24px 24px",
    position: "relative",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
  },
  iconWrapper: {
    width: "56px",
    height: "56px",
    background: "#fef2f2",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 16px",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    color: "#0f172a",
    fontWeight: "700",
  },
  description: {
    margin: "0 0 12px 0",
    color: "#475569",
    fontSize: "15px",
    lineHeight: "1.5",
  },
  warning: {
    margin: "0 0 24px 0",
    color: "#dc2626",
    fontSize: "14px",
    fontWeight: "500",
    background: "#fef2f2",
    padding: "8px",
    borderRadius: "8px",
  },
  errorBox: {
    margin: "0 0 20px 0",
    color: "#dc2626",
    fontSize: "14px",
    background: "#fef2f2",
    padding: "12px",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    textAlign: "left",
  },
  footer: { display: "flex", gap: "12px" },
  cancelButton: {
    flex: 1,
    padding: "10px 0",
    background: "#fff",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    color: "#475569",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "15px",
  },
  deleteButton: {
    flex: 1,
    padding: "10px 0",
    background: "#dc2626",
    border: "1px solid #dc2626",
    borderRadius: "10px",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "15px",
  },
};
