import React from "react";
import { Edit2, Trash2 } from "lucide-react";

export default function ActionButtons({ onEdit, onDelete, itemName = "item" }) {
  const handleEdit = (e) => {
    e.stopPropagation(); // Prevents the table row from expanding/collapsing when clicked
    if (onEdit) onEdit();
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevents the table row from expanding/collapsing
    if (onDelete) onDelete();
  };

  return (
    <div style={styles.container}>
      <button
        onClick={handleEdit}
        style={styles.iconBtn}
        title={`Edit ${itemName}`}
      >
        <Edit2 size={16} />
      </button>
      <button
        onClick={handleDelete}
        style={styles.iconBtnDanger}
        title={`Delete ${itemName}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    alignItems: "center",
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
    transition: "all 0.2s",
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
    transition: "all 0.2s",
  },
};
