import React, { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
}) {
  // Automatically close the toast after 'duration' milliseconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === "success";

  // Dynamic colors based on success vs error
  const bgColor = isSuccess ? "#f0fdf4" : "#fef2f2";
  const borderColor = isSuccess ? "#bbf7d0" : "#fecaca";
  const iconColor = isSuccess ? "#16a34a" : "#dc2626";
  const textColor = isSuccess ? "#15803d" : "#b91c1c";

  return (
    <div
      style={{
        ...styles.container,
        background: bgColor,
        borderColor: borderColor,
      }}
    >
      <div style={styles.content}>
        {isSuccess ? (
          <CheckCircle size={20} color={iconColor} />
        ) : (
          <XCircle size={20} color={iconColor} />
        )}
        <span style={{ ...styles.message, color: textColor }}>{message}</span>
      </div>

      <button onClick={onClose} style={styles.closeBtn}>
        <X size={16} color={iconColor} />
      </button>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid",
    boxShadow:
      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
    zIndex: 9999,
    minWidth: "300px",
    animation: "slideIn 0.3s ease-out forwards",
  },
  content: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  message: {
    fontSize: "15px",
    fontWeight: "600",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    opacity: 0.7,
  },
};

// Note: To make the slide-in animation work, you can add this to your main index.css or App.css:
/*
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
*/
