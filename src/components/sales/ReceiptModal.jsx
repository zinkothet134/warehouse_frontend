import React, { useEffect } from "react";
import { X, Printer, Receipt } from "lucide-react";

export default function ReceiptModal({ order, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!order) return null;

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalWrapper} onClick={(e) => e.stopPropagation()}>
        {/* ACTION BUTTONS (Hidden during print) */}
        <div style={styles.actionHeader} className="no-print">
          <button onClick={handlePrint} style={styles.printBtn}>
            <Printer size={16} /> Print
          </button>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} color="#64748b" />
          </button>
        </div>

        {/* RECEIPT PAPER */}
        <div style={styles.receiptPaper} className="print-area">
          {/* Header */}
          <div style={styles.receiptHeader}>
            <div style={styles.logoWrapper}>
              <Receipt size={32} color="#0f172a" />
            </div>
            <h2 style={styles.storeName}>CHUE FAMILY BUSINESS</h2>
            <p style={styles.storeDetails}>
              Pyigyidagon Tsp, 53 Street, 128X129 Street
            </p>
            <p style={styles.storeDetails}>MDY, MMR</p>
          </div>

          <div style={styles.divider}></div>

          {/* Meta Info */}
          <div style={styles.metaInfo}>
            <div style={styles.metaRow}>
              <span>Order #:</span>
              <strong>REC-{order.id.toString().padStart(6, "0")}</strong>
            </div>
            <div style={styles.metaRow}>
              <span>Date:</span>
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>
            <div style={styles.metaRow}>
              <span>Customer:</span>
              <span>{order.customer_name || "Walk-in Customer"}</span>
            </div>
            <div style={styles.metaRow}>
              <span>Payment:</span>
              <span>{order.payment_method}</span>
            </div>
            <div style={styles.metaRow}>
              <span>Status:</span>
              <strong
                style={{
                  color: order.status === "VOID" ? "#dc2626" : "#16a34a",
                }}
              >
                {order.status || "COMPLETED"}
              </strong>
            </div>
          </div>

          <div style={styles.divider}></div>

          {/* Items Table */}
          <table style={styles.itemsTable}>
            <thead>
              <tr>
                <th style={{ ...styles.th, textAlign: "left" }}>Item</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Qty</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <tr key={index}>
                    <td style={styles.td}>
                      {/* 1. Show the real Product Name */}
                      <div style={styles.itemName}>
                        {item.product_name || "Unknown Product"}
                      </div>

                      {/* 2. Show the SKU right below it */}
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          marginBottom: "2px",
                        }}
                      >
                        SKU: {item.sku || "N/A"}
                      </div>

                      {/* 3. Show the individual price */}
                      <div style={styles.itemPrice}>
                        @ ${Number(item.price_at_sale).toFixed(2)}
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {item.quantity}
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      ${(item.quantity * item.price_at_sale).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    style={{
                      ...styles.td,
                      textAlign: "center",
                      color: "#94a3b8",
                      padding: "20px 0",
                    }}
                  >
                    No items found for this order.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={styles.divider}></div>

          {/* Totals */}
          <div style={styles.totalsArea}>
            <div style={styles.totalRow}>
              <span>Total Amount</span>
              <span style={styles.grandTotal}>
                ${Number(order.total_amount).toFixed(2)}
              </span>
            </div>
          </div>

          <div style={styles.divider}></div>

          {/* Footer */}
          <div style={styles.footer}>
            <p>Thank you for shopping with us!</p>
            <p style={styles.barcode}>
              *{order.id.toString().padStart(8, "0")}*
            </p>
          </div>
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
  modalWrapper: {
    width: "100%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "90vh",
  },
  actionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    padding: "12px 16px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  },
  printBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  closeBtn: {
    background: "#f1f5f9",
    border: "none",
    padding: "6px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
  },

  receiptPaper: {
    background: "#fff",
    borderRadius: "8px",
    padding: "32px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
    overflowY: "auto",
    fontFamily: "'Courier New', Courier, monospace",
  },
  receiptHeader: { textAlign: "center", marginBottom: "24px" },
  logoWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "12px",
  },
  storeName: {
    margin: "0 0 4px 0",
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
  },
  storeDetails: { margin: "2px 0", fontSize: "12px", color: "#475569" },

  divider: { borderBottom: "2px dashed #cbd5e1", margin: "20px 0" },

  metaInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "13px",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    color: "#334155",
  },

  itemsTable: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  th: { paddingBottom: "12px", fontWeight: "700", color: "#0f172a" },
  td: { paddingTop: "12px", verticalAlign: "top", color: "#334155" },
  itemName: { fontWeight: "700", color: "#0f172a", marginBottom: "4px" },
  itemPrice: { fontSize: "12px", color: "#64748b" },

  totalsArea: { display: "flex", flexDirection: "column", gap: "8px" },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
  },
  grandTotal: { fontSize: "24px" },

  footer: {
    textAlign: "center",
    color: "#475569",
    fontSize: "13px",
    marginTop: "32px",
  },
  barcode: {
    fontFamily: "'Libre Barcode 39', 'Courier New', monospace",
    fontSize: "40px",
    margin: "16px 0 0 0",
    color: "#0f172a",
    fontWeight: "normal",
  },
};
