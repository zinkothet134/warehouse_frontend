// src/pages/Inventory.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../libs/api";

export default function Inventory() {
  const [stockLevels, setStockLevels] = useState([]);
  const [totalDatabaseSKUs, setTotalDatabaseSKUs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Search State
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const executeSearch = () => {
    if (search === activeSearch && currentPage === 1) return;
    setActiveSearch(search);
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeSearch();
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchInventory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(
          `/inventory/levels/?page=${currentPage}&search=${activeSearch}`,
          { signal: controller.signal },
        );

        setStockLevels(response.data.results || response.data);
        setTotalDatabaseSKUs(response.data.count || 0);

        setHasNext(!!response.data.next);
        setHasPrev(!!response.data.previous);
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          setError("Failed to load inventory data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();

    return () => {
      controller.abort();
    };
  }, [currentPage, activeSearch]);

  const lowStockCount = stockLevels.filter((item) => item.is_low_stock).length;
  const totalQuantityOnPage = stockLevels.reduce(
    (sum, item) => sum + Number(item.quantity_on_hand || 0),
    0,
  );

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Warehouse Inventory</h1>
          <p style={styles.subtitle}>Monitor stock levels across warehouses</p>
        </div>
        <Link to="/inventory/receive" style={{ textDecoration: "none" }}>
          <button style={styles.receiveBtn}>📦 Receive Stock</button>
        </Link>
      </div>

      {/* STATS */}
      <div style={styles.statsGrid}>
        <StatCard title="Total Unique SKUs" value={totalDatabaseSKUs} />
        <StatCard
          title="Total Quantity (This Page)"
          value={totalQuantityOnPage}
        />
        <StatCard
          title="Low Stock (This Page)"
          value={lowStockCount}
          color="#dc2626"
        />
      </div>

      {/* SEARCH */}
      <div style={styles.searchWrapper}>
        <input
          type="text"
          placeholder="Search SKU, Product or Location... (Press Enter)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          style={styles.searchInput}
        />
        <button onClick={executeSearch} style={styles.searchActionBtn}>
          Search
        </button>
      </div>

      {/* ERROR & LOADING STATES */}
      {error && <div style={styles.error}>{error}</div>}

      {/* INVENTORY TABLE */}
      <div
        style={{
          opacity: loading && stockLevels.length > 0 ? 0.5 : 1,
          transition: "opacity 0.2s",
        }}
      >
        {stockLevels.length === 0 && !loading && !error ? (
          <div style={styles.emptyState}>No inventory records found.</div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>SKU</th>
                  <th style={styles.th}>Product Name</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Quantity</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stockLevels.map((item) => (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.skuText}>{item.sku}</span>
                    </td>
                    <td style={styles.td}>
                      <strong style={{ color: "#0f172a", fontSize: "15px" }}>
                        {item.product_name}
                      </strong>
                    </td>
                    <td style={styles.td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        📍 {item.location_name}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.quantityText}>
                        {item.quantity_on_hand}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {item.is_low_stock ? (
                        <span style={styles.lowStockBadge}>Low Stock</span>
                      ) : (
                        <span style={styles.inStockBadge}>In Stock</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalDatabaseSKUs > 0 && (
        <div style={styles.paginationControls}>
          <button
            style={styles.pageBtn}
            disabled={!hasPrev || loading}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            &larr; Previous
          </button>

          <span style={styles.pageIndicator}>Page {currentPage}</span>

          <button
            style={styles.pageBtn}
            disabled={!hasNext || loading}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color = "#0f172a" }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statValue, color }}>{value}</div>
      <div style={styles.statTitle}>{title}</div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "32px",
    background: "#f8fafc",
    minHeight: "100vh",
  },
  error: {
    padding: "20px",
    textAlign: "center",
    color: "#dc2626",
    fontWeight: "600",
    background: "#fef2f2",
    borderRadius: "12px",
    border: "1px solid #fecaca",
    marginBottom: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "28px",
  },
  pageTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  subtitle: { marginTop: "6px", color: "#64748b", fontSize: "15px" },
  receiveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,.02)",
    border: "1px solid #e2e8f0",
  },
  statValue: { fontSize: "32px", fontWeight: "700" },
  statTitle: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
  },

  // New Search Styles
  searchWrapper: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },
  searchInput: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
    fontSize: "14px",
    outline: "none",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  searchActionBtn: {
    padding: "0 24px",
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  // MODERN TABLE STYLES
  tableContainer: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    overflowX: "auto",
    boxShadow:
      "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  th: {
    padding: "16px 20px",
    borderBottom: "1px solid #e2e8f0",
    color: "#64748b",
    fontWeight: "600",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    background: "#f8fafc",
  },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: {
    padding: "16px 20px",
    color: "#475569",
    fontSize: "14px",
    verticalAlign: "middle",
  },
  skuText: {
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#2563eb",
    background: "#eff6ff",
    padding: "4px 8px",
    borderRadius: "6px",
  },
  quantityText: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
  },
  lowStockBadge: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    border: "1px solid #fecaca",
    display: "inline-block",
  },
  inStockBadge: {
    background: "#f0fdf4",
    color: "#16a34a",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    border: "1px solid #bbf7d0",
    display: "inline-block",
  },
  emptyState: {
    background: "#fff",
    padding: "60px",
    borderRadius: "12px",
    textAlign: "center",
    color: "#64748b",
    border: "1px dashed #cbd5e1",
  },

  // Pagination
  paginationControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "24px",
    padding: "16px",
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  pageBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    color: "#334155",
  },
  pageIndicator: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: "15px",
  },
};
