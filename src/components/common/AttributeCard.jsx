import React from "react";
import AttributeItem from "./AttributeItem";

export default function AttributeCard({
  title,
  icon,
  items,
  inputValue,
  setInputValue,
  onAdd,
  onEdit,
  onDelete,
}) {
  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>
        {icon} {title}
      </h2>

      <div style={styles.inputRow}>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          placeholder={`Add new ${title.toLowerCase()}...`}
          style={styles.input}
        />
        <button onClick={onAdd} style={styles.addBtn}>
          Add
        </button>
      </div>

      <div style={styles.listContainer}>
        {items.length === 0 ? (
          <p style={styles.emptyText}>No {title.toLowerCase()} added yet.</p>
        ) : (
          items.map((item) => (
            <AttributeItem
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
  },
  cardTitle: {
    fontSize: "20px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#0f172a",
    fontWeight: "700",
  },
  inputRow: { display: "flex", gap: "10px", marginBottom: "24px" },
  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: "14px",
    color: "#ffffff",
  },
  addBtn: {
    padding: "0 20px",
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "background 0.2s",
  },
  listContainer: { display: "flex", flexDirection: "column", gap: "8px" },
  emptyText: { color: "#94a3b8", fontSize: "14px", fontStyle: "italic" },
};
