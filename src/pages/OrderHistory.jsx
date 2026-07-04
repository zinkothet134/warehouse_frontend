import React, { useState, useEffect } from "react";
import api from "../libs/api";
import { Search, Filter, Receipt, Eye, Inbox } from "lucide-react";
import ReceiptModal from "../components/sales/ReceiptModal";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // ADD THIS LINE HERE!
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchOrders();
  }, [currentPage, activeSearch, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage };
      if (activeSearch) params.search = activeSearch;
      if (statusFilter !== "ALL") params.status = statusFilter;

      // Adjust this URL to match your Django router for orders
      const response = await api.get("/sales/orders/", { params });

      setOrders(response.data.results || response.data);
      setTotalCount(response.data.count || 0);
      setHasNext(Boolean(response.data.next));
      setHasPrev(Boolean(response.data.previous));
    } catch (err) {
      setError("Failed to load order history.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setActiveSearch(search);
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };
      case "REFUNDED":
        return { bg: "#fffbeb", text: "#d97706", border: "#fde68a" };
      case "VOID":
        return { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" };
      default:
        return { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" };
    }
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Order History</h1>
          <p style={styles.subtitle}>View past transactions and receipts.</p>
        </div>
      </div>

      {/* ACTION BAR */}
      <div style={styles.actionBar}>
        <div style={styles.searchWrapper}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search Order ID or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.searchInput}
          />
          <button onClick={handleSearch} style={styles.searchButton}>
            Search
          </button>
        </div>

        <div style={styles.filterWrapper}>
          <Filter size={18} color="#64748b" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={styles.filterSelect}
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="REFUNDED">Refunded</option>
            <option value="VOID">Void</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      {loading && orders.length === 0 ? (
        <div style={styles.emptyCard}>Loading orders...</div>
      ) : error ? (
        <div style={styles.errorCard}>{error}</div>
      ) : orders.length === 0 ? (
        <div style={styles.emptyCard}>
          <Inbox size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
          <h3 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>
            No orders found
          </h3>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Date & Time</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Payment</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.primaryText}>
                      <Receipt size={16} color="#64748b" />
                      REC-{order.id.toString().padStart(6, "0")}
                    </div>
                  </td>
                  <td style={styles.td}>
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                  <td style={styles.td}>
                    <strong style={{ color: "#0f172a" }}>
                      {order.customer_name || "Walk-in Customer"}
                    </strong>
                  </td>
                  <td style={styles.td}>{order.payment_method}</td>
                  <td style={styles.td}>
                    <strong style={{ color: "#2563eb", fontSize: "15px" }}>
                      ${Number(order.total_amount).toFixed(2)}
                    </strong>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor: getStatusColor(
                          order.status || "COMPLETED",
                        ).bg,
                        color: getStatusColor(order.status || "COMPLETED").text,
                        border: `1px solid ${getStatusColor(order.status || "COMPLETED").border}`,
                      }}
                    >
                      {order.status || "COMPLETED"}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <button
                      style={styles.actionBtn}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {totalCount > 0 && (
        <div style={styles.pagination}>
          <button
            disabled={!hasPrev}
            onClick={() => setCurrentPage((p) => p - 1)}
            style={styles.pageBtn}
          >
            &larr; Previous
          </button>
          <div style={styles.pageInfo}>Page {currentPage}</div>
          <button
            disabled={!hasNext}
            onClick={() => setCurrentPage((p) => p + 1)}
            style={styles.pageBtn}
          >
            Next &rarr;
          </button>
        </div>
      )}
      {/* RECEIPT MODAL */}
      <ReceiptModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

const styles = {
  page: { padding: "32px", background: "#f8fafc", minHeight: "100vh" },
  header: { marginBottom: "28px" },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  subtitle: { marginTop: "6px", color: "#64748b", fontSize: "15px" },

  actionBar: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  searchWrapper: {
    flex: "1 1 300px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff",
    padding: "8px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    background: "transparent",
    color: "#0f172a",
  },
  searchButton: {
    background: "#f1f5f9",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontWeight: "600",
    color: "#475569",
    cursor: "pointer",
  },
  filterWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff",
    padding: "8px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  filterSelect: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "14px",
    color: "#0f172a",
    fontWeight: "500",
    cursor: "pointer",
  },

  tableContainer: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    overflowX: "auto",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
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
    background: "#f8fafc",
  },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: {
    padding: "16px 20px",
    color: "#475569",
    fontSize: "14px",
    verticalAlign: "middle",
  },

  primaryText: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#0f172a",
    fontWeight: "700",
  },
  contactRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#64748b",
    fontSize: "13px",
  },
  badge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    display: "inline-block",
  },
  pill: {
    background: "#f1f5f9",
    color: "#475569",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },

  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#0f172a",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "13px",
  },

  emptyCard: {
    background: "#fff",
    padding: "64px 20px",
    borderRadius: "12px",
    textAlign: "center",
    border: "1px dashed #cbd5e1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#64748b",
  },
  errorCard: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #fecaca",
    fontWeight: "500",
  },

  pagination: {
    marginTop: "24px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    fontWeight: "600",
    cursor: "pointer",
  },
  pageInfo: { fontSize: "15px", fontWeight: "600", color: "#0f172a" },
};
