import React from "react";
import { X, AlertCircle } from "lucide-react";

export default function ErrorModal({
  isOpen,
  onClose,
  title = "Validation Error",
  errorMessages = [],
}) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* CLOSE BUTTON */}
        <button onClick={onClose} style={styles.closeButton}>
          <X size={20} color="#64748b" />
        </button>

        {/* RED ERROR ICON */}
        <div style={styles.iconWrapper}>
          <AlertCircle size={28} color="#dc2626" />
        </div>

        <h2 style={styles.title}>{title}</h2>
        <p style={styles.subtitle}>
          Please fix the following issues before saving:
        </p>

        {/* ERROR LIST */}
        <div style={styles.errorContainer}>
          <ul style={styles.errorList}>
            {errorMessages.map((msg, index) => (
              <li key={index} style={styles.errorItem}>
                {msg}
              </li>
            ))}
          </ul>
        </div>

        {/* ACTION BUTTON */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.dismissButton}>
            Got it
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
  subtitle: { margin: "0 0 20px 0", color: "#64748b", fontSize: "14px" },

  errorContainer: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "16px",
    textAlign: "left",
    marginBottom: "24px",
    maxHeight: "200px",
    overflowY: "auto", // Allows scrolling if there are many errors
  },
  errorList: {
    margin: 0,
    paddingLeft: "20px",
    color: "#dc2626",
    fontSize: "14px",
  },
  errorItem: { marginBottom: "6px", fontWeight: "500" },

  footer: { display: "flex" },
  dismissButton: {
    flex: 1,
    padding: "12px 0",
    background: "#0f172a",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "15px",
    transition: "background 0.2s",
  },
};
