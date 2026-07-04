import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../libs/api"; // Adjust your API import path as needed
import {
  Plus,
  FileText,
  MoreVertical,
  Search,
  Filter,
  Inbox,
} from "lucide-react";
import DeletePurchaseOrderModal from "../components/purchasing/DeletePurchaseOrderModal";

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [openMenu, setOpenMenu] = useState(null);
  const [deleteOrder, setDeleteOrder] = useState(null);

  // Backend Filter State
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState(""); // Only search when clicking button/Enter
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Backend Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, activeSearch, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // 1. Create a clean object with our base parameters
      const queryParams = {
        page: currentPage,
      };
      // // Build the query string dynamically
      // let url = `/purchasing/purchase-orders/?page=${currentPage}`;

      if (activeSearch) {
        queryParams.search = activeSearch;
      }

      if (statusFilter !== "ALL") {
        queryParams.status = statusFilter;
      }
      const response = await api.get("/purchasing/purchase-orders/", {
        params: queryParams,
      });

      // Update state with paginated DRF response
      setOrders(response.data.results || []);
      setTotalCount(response.data.count || 0);
      setHasNext(Boolean(response.data.next));
      setHasPrev(Boolean(response.data.previous));
    } catch (err) {
      setError("Failed to load purchase orders.");
    } finally {
      setLoading(false);
    }
  };
  // Trigger search on button click or Enter key
  const executeSearch = () => {
    setActiveSearch(search);
    setCurrentPage(1); // Reset to page 1 on new search
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") executeSearch();
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to page 1 on new filter
  };

  const handleDeleteSuccess = () => {
    setDeleteOrder(null);
    fetchOrders(); // Refresh the list
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" };
      case "ORDERED":
        return { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" };
      case "RECEIVED":
        return { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };
      case "CANCELLED":
        return { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" };
      default:
        return { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" };
    }
  };

  // // Client-side filtering logic
  // const filteredOrders = orders.filter((order) => {
  //   const matchesSearch =
  //     order.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     order.id.toString().includes(searchTerm);

  //   const matchesStatus =
  //     statusFilter === "ALL" || order.status === statusFilter;

  //   return matchesSearch && matchesStatus;
  // });

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Purchase Orders</h1>
          <p style={styles.subtitle}>
            Manage incoming inventory and supplier orders.
          </p>
        </div>

        <Link
          to="/purchasing/purchase-orders/add"
          style={{ textDecoration: "none" }}
        >
          <button style={styles.addButton}>
            <Plus size={18} />
            Create Order
          </button>
        </Link>
      </div>

      {/* ACTION BAR (Backend Search & Filters) */}
      <div style={styles.actionBar}>
        <div style={styles.searchWrapper}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search by ID or Supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.searchInput}
          />
          <button onClick={executeSearch} style={styles.searchButton}>
            Search
          </button>
        </div>

        <div style={styles.filterWrapper}>
          <Filter size={18} color="#64748b" />
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            style={styles.filterSelect}
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ORDERED">Ordered</option>
            <option value="RECEIVED">Received</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* STATS */}
      <div
        style={{
          marginBottom: "16px",
          color: "#64748b",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        Showing {orders.length} of {totalCount} total orders
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div style={styles.emptyCard}>
          <div className="animate-pulse">Loading orders...</div>
        </div>
      ) : error ? (
        <div style={styles.errorCard}>{error}</div>
      ) : orders.length === 0 ? (
        <div style={styles.emptyCard}>
          <Inbox size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
          <h3 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>
            No orders found
          </h3>
          <p style={{ margin: 0, color: "#64748b" }}>
            Adjust your search or filter criteria.
          </p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Supplier</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Expected</th>
                <th style={styles.th}>Items</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Notice we map directly over 'orders' now, not 'filteredOrders' */}
              {orders.map((order, index) => {
                // 2. Calculate if this row is near the bottom of the table
                const isNearBottom =
                  index >= orders.length - 2 && orders.length > 3;
                return (
                  <tr key={order.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.orderId}>
                        <FileText size={16} color="#64748b" />
                        PO #{order.id}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <strong style={{ color: "#0f172a" }}>
                        {order.supplier_name || `Supplier #${order.supplier}`}
                      </strong>
                    </td>
                    <td style={styles.td}>
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      {order.expected_delivery
                        ? new Date(order.expected_delivery).toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.itemPill}>
                        {order.items?.length || 0}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: getStatusColor(order.status).bg,
                          color: getStatusColor(order.status).text,
                          border: `1px solid ${getStatusColor(order.status).border}`,
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block",
                        }}
                      >
                        <button
                          style={styles.iconButton}
                          onClick={() =>
                            setOpenMenu(openMenu === order.id ? null : order.id)
                          }
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openMenu === order.id && (
                          <>
                            <div
                              style={styles.dropdownOverlay}
                              onClick={() => setOpenMenu(null)}
                            />
                            {/* APPLY THE DROP-UP LOGIC HERE */}
                            <div
                              style={{
                                ...styles.dropdown,
                                top: isNearBottom ? "auto" : "calc(100% + 4px)",
                                bottom: isNearBottom
                                  ? "calc(100% + 4px)"
                                  : "auto",
                              }}
                            >
                              <Link
                                to={`/purchasing/purchase-orders/edit/${order.id}`}
                                style={styles.dropdownItem}
                              >
                                ✏️ Edit Order
                              </Link>
                              <div style={styles.dropdownDivider}></div>
                              <button
                                style={{
                                  ...styles.dropdownItem,
                                  color: "#dc2626",
                                }}
                                onClick={() => {
                                  setDeleteOrder(order);
                                  setOpenMenu(null);
                                }}
                              >
                                🗑 Delete Order
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* BACKEND PAGINATION CONTROLS */}
      {totalCount > 0 && (
        <div style={styles.pagination}>
          <button
            disabled={!hasPrev}
            onClick={() => setCurrentPage((p) => p - 1)}
            style={{
              ...styles.paginationButton,
              opacity: !hasPrev ? 0.5 : 1,
              cursor: !hasPrev ? "not-allowed" : "pointer",
            }}
          >
            ← Previous
          </button>

          <div style={styles.pageInfo}>Page {currentPage}</div>

          <button
            disabled={!hasNext}
            onClick={() => setCurrentPage((p) => p + 1)}
            style={{
              ...styles.paginationButton,
              opacity: !hasNext ? 0.5 : 1,
              cursor: !hasNext ? "not-allowed" : "pointer",
            }}
          >
            Next →
          </button>
        </div>
      )}

      <DeletePurchaseOrderModal
        order={deleteOrder}
        onClose={() => setDeleteOrder(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

const styles = {
  page: { padding: "32px", background: "#f8fafc", minHeight: "100vh" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  subtitle: { marginTop: "6px", color: "#64748b", fontSize: "15px" },
  addButton: {
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
    transition: "transform 0.1s, box-shadow 0.1s",
  },

  // NEW ACTION BAR STYLES
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
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
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
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    background: "transparent",
    color: "#0f172a",
  },
  filterWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
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

  // TABLE STYLES
  tableContainer: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    overflowX: "auto",
    minHeight: "280px",
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
  orderId: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#0f172a",
    fontWeight: "600",
  },
  itemPill: {
    background: "#f1f5f9",
    color: "#475569",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    display: "inline-block",
  },

  // DROPDOWN & BUTTONS
  iconButton: {
    background: "transparent",
    border: "1px solid transparent",
    color: "#94a3b8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
    borderRadius: "8px",
    transition: "all 0.2s",
  },
  dropdownOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 90,
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 4px)",
    right: 0,
    width: "180px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    boxShadow:
      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
    overflow: "hidden",
    zIndex: 100,
    padding: "4px",
  },
  dropdownDivider: {
    height: "1px",
    background: "#f1f5f9",
    margin: "4px 0",
  },
  dropdownItem: {
    width: "100%",
    padding: "10px 12px",
    border: "none",
    background: "transparent",
    textAlign: "left",
    cursor: "pointer",
    textDecoration: "none",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: "6px",
  },

  // ERROR & EMPTY STATES
  emptyCard: {
    background: "#fff",
    padding: "64px 20px",
    borderRadius: "12px",
    textAlign: "center",
    border: "1px dashed #cbd5e1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  errorCard: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #fecaca",
    fontWeight: "500",
  },
  // Add these for the new pagination bar at the bottom
  pagination: {
    marginTop: "24px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  paginationButton: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    fontWeight: "600",
  },
  pageInfo: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#0f172a",
  },
};
