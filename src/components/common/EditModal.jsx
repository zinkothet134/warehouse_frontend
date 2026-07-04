import React from "react";
import { X, Edit3 } from "lucide-react";

export default function EditModal({
  isOpen,
  onClose,
  onSave,
  title = "Edit Item",
  loading = false,
  error = null,
  children, // 🌟 This allows you to pass custom inputs inside the modal!
}) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* CLOSE BUTTON */}
        <button onClick={onClose} disabled={loading} style={styles.closeButton}>
          <X size={20} color="#64748b" />
        </button>

        {/* BLUE EDIT ICON */}
        <div style={styles.iconWrapper}>
          <Edit3 size={28} color="#2563eb" />
        </div>

        <h2 style={styles.title}>{title}</h2>

        {/* ERROR MESSAGE */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* 🌟 DYNAMIC FORM CONTENT GOES HERE */}
        <div style={styles.formContainer}>{children}</div>

        {/* ACTION BUTTONS */}
        <div style={styles.footer}>
          <button
            onClick={onClose}
            disabled={loading}
            style={styles.cancelButton}
          >
            Cancel
          </button>
          <button onClick={onSave} disabled={loading} style={styles.saveButton}>
            {loading ? "Saving..." : "Save Changes"}
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
    maxWidth: "450px",
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
    background: "#eff6ff",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 16px",
  },
  title: {
    margin: "0 0 20px 0",
    fontSize: "20px",
    color: "#0f172a",
    fontWeight: "700",
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

  formContainer: {
    textAlign: "left", // Form inputs should be left-aligned
    marginBottom: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
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
    transition: "background 0.2s",
  },
  saveButton: {
    flex: 1,
    padding: "10px 0",
    background: "#2563eb",
    border: "1px solid #2563eb",
    borderRadius: "10px",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "15px",
    transition: "background 0.2s",
  },
};
