import React, { useState } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";

export default function AttributeItem({ item, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.name);

  const handleSave = async () => {
    if (editValue === item.name) {
      setIsEditing(false);
      return;
    }
    try {
      await onEdit(item.id, editValue);
      setIsEditing(false);
    } catch (error) {
      // Parent handles the error alert
    }
  };

  if (isEditing) {
    return (
      <div style={styles.itemWrapperEditing}>
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          style={styles.editInput}
        />
        <button onClick={handleSave} style={styles.iconBtnSuccess} title="Save">
          <Check size={16} />
        </button>
        <button
          onClick={() => setIsEditing(false)}
          style={styles.iconBtnCancel}
          title="Cancel"
        >
          <X size={16} />
        </button>
      </div>
    );
  }
  return (
    <div style={styles.itemWrapper}>
      <span style={styles.itemName}>{item.name}</span>
      <div style={styles.itemActions}>
        <button
          onClick={() => setIsEditing(true)}
          style={styles.iconBtn}
          title="Edit"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          style={styles.iconBtnDanger}
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  itemWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f8fafc",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  itemName: { fontSize: "14px", color: "#334155", fontWeight: "500" },
  itemActions: { display: "flex", gap: "6px" },

  itemWrapperEditing: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    background: "#fff",
    padding: "6px",
    borderRadius: "10px",
    border: "1px solid #3b82f6",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
  },
  editInput: {
    flex: 1,
    padding: "6px 10px",
    border: "none",
    outline: "none",
    fontSize: "14px",
    color: "#0f172a",
    fontWeight: "500",
    background: "transparent",
  },

  iconBtn: {
    background: "#fff",
    border: "1px solid #cbd5e1",
    padding: "6px",
    borderRadius: "6px",
    color: "#64748b",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnDanger: {
    background: "#fff",
    border: "1px solid #fecaca",
    padding: "6px",
    borderRadius: "6px",
    color: "#ef4444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnSuccess: {
    background: "#22c55e",
    border: "none",
    padding: "6px",
    borderRadius: "6px",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnCancel: {
    background: "#f1f5f9",
    border: "none",
    padding: "6px",
    borderRadius: "6px",
    color: "#64748b",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
