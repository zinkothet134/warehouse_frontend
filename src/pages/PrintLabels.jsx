import React, { useState, useEffect } from "react";
import api from "../libs/api";
import {
  Search,
  Printer,
  Plus,
  Minus,
  Trash2,
  Package,
  XCircle,
} from "lucide-react";
import PrintableQRCode from "../components/common/PrintableQRCode";

export default function PrintLabels() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // The list of labels we want to print and how many of each
  const [printQueue, setPrintQueue] = useState([]);

  useEffect(() => {
    fetchVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSearch]);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `products/variants/?search=${activeSearch}`,
      );
      setVariants(response.data.results || response.data);
    } catch (err) {
      console.error("Failed to fetch variants", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setActiveSearch(search);
    }
  };

  const addToQueue = (variant) => {
    setPrintQueue((prev) => {
      const existing = prev.find((item) => item.variant.id === variant.id);
      if (existing) {
        return prev.map((item) =>
          item.variant.id === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { variant, quantity: 1 }];
    });
  };

  const updateQuantity = (variantId, delta) => {
    setPrintQueue((prev) =>
      prev
        .map((item) => {
          if (item.variant.id === variantId) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: newQty > 0 ? newQty : 0 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromQueue = (variantId) => {
    setPrintQueue((prev) =>
      prev.filter((item) => item.variant.id !== variantId),
    );
  };

  const clearQueue = () => {
    if (
      window.confirm("Are you sure you want to clear the entire print queue?")
    ) {
      setPrintQueue([]);
    }
  };

  // Calculates the total number of stickers that will be printed
  const totalLabels = printQueue.reduce((sum, item) => sum + item.quantity, 0);

  const handlePrint = () => {
    window.print();
  };

  // Helper to check how many of a variant are in the queue
  const getQueueCount = (variantId) => {
    const item = printQueue.find((q) => q.variant.id === variantId);
    return item ? item.quantity : 0;
  };

  return (
    <>
      {/* 🌟 PERFECT 3-COLUMN A4 PRINT CSS 🌟 */}
      <style>
        {`
          @media screen {
            .print-only { display: none !important; }
          }

          @media print {
            /* 1. Disable browser's auto-generated headers, footers, and margins */
            @page {
              size: A4 portrait;
              margin: 10mm; /* Minimal margins to maximize space */
            }

            /* 2. Hide web UI */
            .sidebar, nav, .no-print {
              display: none !important;
            }

            /* 3. Force clean background */
            body, html {
              background-color: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            /* 4. Strict Grid Layout */
            .print-only {
              display: grid !important;
              grid-template-columns: repeat(3, 1fr) !important; /* Forces 3 columns */
              grid-auto-rows: min-content !important; /* Keeps rows tight */
              gap: 15px !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            /* 5. Force every sticker to be a fixed size so it doesn't jump */
            .print-only > div {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
              border: 1px dashed #cbd5e1 !important; 
              padding: 8px !important;
              border-radius: 8px !important;
              display: flex !important;
              justify-content: center !important;
              align-items: center !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }
          }
        `}
      </style>
      <div style={styles.pageLayout} className="page-layout">
        {/* LEFT SIDE: SEARCH & SELECT */}
        <div style={styles.selectionPanel} className="no-print">
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Print QR Labels</h1>
              <p style={styles.subtitle}>
                Search products and add them to your print queue to generate
                barcode stickers.
              </p>
            </div>
          </div>

          <div style={styles.searchWrapper}>
            <Search size={18} color="#64748b" style={{ marginLeft: "14px" }} />
            <input
              type="text"
              placeholder="Search by SKU, Product Name, or Color..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              style={styles.searchInput}
            />
            <button
              onClick={() => setActiveSearch(search)}
              style={styles.searchActionBtn}
            >
              Search
            </button>
          </div>

          <div style={styles.gridWrapper}>
            {loading ? (
              <div style={styles.loading}>Loading catalog...</div>
            ) : variants.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIconWrapper}>
                  <Package size={40} color="#94a3b8" />
                </div>
                <h3 style={styles.emptyStateTitle}>No products found</h3>
                <p style={styles.emptyStateText}>
                  Try adjusting your search query to find the product you need.
                </p>
              </div>
            ) : (
              <div style={styles.productGrid}>
                {variants.map((v) => {
                  const queuedCount = getQueueCount(v.id);
                  return (
                    <div key={v.id} style={styles.productCard}>
                      <div style={styles.cardHeader}>
                        <div style={styles.productName}>{v.product_name}</div>
                        <div style={styles.skuText}>{v.sku}</div>
                      </div>

                      <div style={styles.badgeRow}>
                        <span style={styles.variantBadge}>{v.color}</span>
                        <span style={styles.variantBadge}>Size {v.size}</span>
                      </div>

                      <div style={styles.cardFooter}>
                        {queuedCount > 0 ? (
                          <div style={styles.queuedBadge}>
                            {queuedCount} in queue
                          </div>
                        ) : (
                          <div></div> /* Spacer */
                        )}
                        <button
                          onClick={() => addToQueue(v)}
                          style={styles.addBtn}
                        >
                          <Plus size={16} /> Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: PRINT QUEUE */}
        <div style={styles.queuePanel} className="no-print">
          <div style={styles.queueHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h2 style={styles.queueTitle}>Print Queue</h2>
              <div style={styles.badge}>{totalLabels}</div>
            </div>
            {printQueue.length > 0 && (
              <button onClick={clearQueue} style={styles.clearBtn}>
                <Trash2 size={14} /> Clear All
              </button>
            )}
          </div>

          <div style={styles.queueItems}>
            {printQueue.length === 0 ? (
              <div style={styles.emptyQueue}>
                <div style={styles.emptyQueueCircle}>
                  <Printer size={32} color="#cbd5e1" />
                </div>
                <p>Your queue is empty.</p>
                <span>
                  Select products from the left to start building your label
                  print sheet.
                </span>
              </div>
            ) : (
              printQueue.map((item) => (
                <div key={item.variant.id} style={styles.queueItem}>
                  <div style={{ flex: 1, paddingRight: "12px" }}>
                    <div style={styles.queueName}>
                      {item.variant.product_name}
                    </div>
                    <div style={styles.queueSku}>{item.variant.sku}</div>
                  </div>

                  <div style={styles.qtyControls}>
                    <button
                      onClick={() => updateQuantity(item.variant.id, -1)}
                      style={styles.qtyBtn}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={styles.qtyText}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variant.id, 1)}
                      style={styles.qtyBtn}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromQueue(item.variant.id)}
                    style={styles.deleteBtn}
                    title="Remove item"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={styles.printActionArea}>
            <button
              disabled={printQueue.length === 0}
              onClick={handlePrint}
              style={{
                ...styles.printBtn,
                opacity: printQueue.length === 0 ? 0.5 : 1,
                cursor: printQueue.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              <Printer size={20} />
              Print {totalLabels} {totalLabels === 1 ? "Label" : "Labels"}
            </button>
            <p style={styles.printHint}>
              Ensure printer is loaded with A4 paper
            </p>
          </div>
        </div>

        {/* 🌟 THE HIDDEN PRINT AREA 🌟 */}
        {/* Changed from style={{ display: "print-only" }} to className="print-only" */}
        <div id="print-area" className="print-only">
          {printQueue.map((item) => {
            const copies = Array.from({ length: item.quantity });
            return copies.map((_, index) => (
              <div key={`${item.variant.id}-${index}`}>
                <PrintableQRCode
                  value={item.variant.sku}
                  productName={`${item.variant.product_name} (${item.variant.color})`}
                />
              </div>
            ));
          })}
        </div>
      </div>
    </>
  );
}

const styles = {
  pageLayout: {
    display: "flex",
    flexWrap: "wrap",
    gap: "24px",
    padding: "24px",
    background: "#f1f5f9", // Slightly darker background to make cards pop
    minHeight: "100vh",
    alignItems: "flex-start",
  },

  // Left Panel
  selectionPanel: {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 60%",
    minWidth: "350px",
    height: "calc(100vh - 48px)",
    boxSizing: "border-box",
  },
  header: { marginBottom: "20px" },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  subtitle: { margin: "6px 0 0 0", color: "#64748b", fontSize: "15px" },

  searchWrapper: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    marginBottom: "24px",
    overflow: "hidden",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    flexShrink: 0,
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    padding: "16px 14px",
    fontSize: "15px",
    color: "#0f172a",
    background: "transparent",
  },
  searchActionBtn: {
    background: "#f8fafc",
    border: "none",
    borderLeft: "1px solid #cbd5e1",
    padding: "0 24px",
    alignSelf: "stretch",
    fontWeight: "600",
    color: "#334155",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background 0.2s",
  },

  // Grid for Products
  gridWrapper: { flex: 1, overflowY: "auto", paddingRight: "8px" },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "16px",
    paddingBottom: "24px",
  },
  productCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  cardHeader: { display: "flex", flexDirection: "column", gap: "4px" },
  productName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: "1.3",
  },
  skuText: {
    fontSize: "13px",
    color: "#64748b",
    fontFamily: "monospace",
    fontWeight: "500",
  },
  badgeRow: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" },
  variantBadge: {
    background: "#f1f5f9",
    color: "#475569",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "auto",
    paddingTop: "12px",
  },
  queuedBadge: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "700",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#0f172a",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background 0.2s",
  },

  // Right Panel: Queue
  queuePanel: {
    flex: "1 1 340px",
    minWidth: "340px",
    maxWidth: "100%",
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    boxShadow:
      "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)",
    position: "sticky",
    top: "24px",
    height: "calc(100vh - 48px)",
    boxSizing: "border-box",
  },
  queueHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "1px solid #f1f5f9",
    flexShrink: 0,
  },
  queueTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#0f172a",
    fontWeight: "800",
  },
  badge: {
    background: "#2563eb",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "700",
  },
  clearBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    color: "#64748b",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },

  queueItems: {
    flex: 1,
    overflowY: "auto",
    marginBottom: "20px",
    paddingRight: "4px",
  },
  emptyQueue: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    textAlign: "center",
    color: "#64748b",
  },
  emptyQueueCircle: {
    width: "64px",
    height: "64px",
    background: "#f1f5f9",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  queueItem: {
    display: "flex",
    alignItems: "center",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "12px",
    marginBottom: "12px",
    border: "1px solid #f1f5f9",
  },
  queueName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "4px",
    lineHeight: "1.3",
  },
  queueSku: { fontSize: "12px", color: "#64748b", fontFamily: "monospace" },

  qtyControls: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff",
    padding: "6px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    marginRight: "12px",
  },
  qtyBtn: {
    background: "#f8fafc",
    border: "none",
    borderRadius: "6px",
    width: "26px",
    height: "26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#475569",
    transition: "background 0.2s",
  },
  qtyText: {
    width: "20px",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
  },

  deleteBtn: {
    background: "transparent",
    color: "#94a3b8",
    border: "none",
    padding: "4px",
    cursor: "pointer",
    display: "flex",
    transition: "color 0.2s",
  },

  printActionArea: {
    flexShrink: 0,
    paddingTop: "16px",
    borderTop: "1px solid #f1f5f9",
  },
  printBtn: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "700",
    transition: "transform 0.1s, opacity 0.2s",
  },
  printHint: {
    textAlign: "center",
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "12px",
    marginBottom: 0,
  },

  loading: {
    textAlign: "center",
    padding: "60px",
    color: "#64748b",
    fontWeight: "500",
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: "16px",
    border: "2px dashed #cbd5e1",
    textAlign: "center",
    marginTop: "12px",
  },
  emptyIconWrapper: {
    width: "80px",
    height: "80px",
    background: "#f8fafc",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  emptyStateTitle: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
  },
  emptyStateText: {
    margin: 0,
    fontSize: "15px",
    color: "#64748b",
    maxWidth: "300px",
  },
};
