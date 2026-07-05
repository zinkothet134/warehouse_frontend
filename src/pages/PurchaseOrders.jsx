import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  FileText,
  MoreVertical,
  Search,
  Filter,
  Inbox,
} from "lucide-react";
import api from "../libs/api";
import DeletePurchaseOrderModal from "../components/purchasing/DeletePurchaseOrderModal";
import EditPurchaseOrderModal from "../components/purchasing/EditPurchaseOrderModal";

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openMenu, setOpenMenu] = useState(null);
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [editingLoading, setEditingLoading] = useState(false);

  const [suppliers, setSuppliers] = useState([]);
  const [variants, setVariants] = useState([]);

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
      };

      if (activeSearch.trim()) {
        params.search = activeSearch.trim();
      }

      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const response = await api.get("purchasing/purchase-orders/", {
        params,
      });

      const data = response.data;

      setOrders(data.results || data || []);
      setTotalCount(data.count || 0);
      setHasNext(Boolean(data.next));
      setHasPrev(Boolean(data.previous));
    } catch (err) {
      console.error("Failed to load purchase orders:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load purchase orders. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadModalData = async () => {
    try {
      const [supplierResponse, variantResponse] = await Promise.all([
        api.get("purchasing/suppliers/", {
          params: { page_size: 500 },
        }),
        api.get("products/variants/", {
          params: { page_size: 500 },
        }),
      ]);

      setSuppliers(
        supplierResponse.data.results || supplierResponse.data || [],
      );
      setVariants(variantResponse.data.results || variantResponse.data || []);
    } catch (err) {
      console.error("Unable to load purchase order modal data:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, activeSearch, statusFilter]);

  useEffect(() => {
    loadModalData();
  }, []);

  const executeSearch = () => {
    setCurrentPage(1);
    setActiveSearch(search);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      executeSearch();
    }
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleDeleteSuccess = () => {
    setDeleteOrder(null);
    fetchOrders();
  };

  const handleOpenEdit = async (order) => {
    try {
      setEditingLoading(true);
      setOpenMenu(null);
      setError(null);

      // Gets the full purchase order details, including nested items.
      const response = await api.get(`purchasing/purchase-orders/${order.id}/`);

      setEditOrder(response.data);
    } catch (err) {
      console.error("Unable to load purchase order details:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load purchase order details for editing.",
      );
    } finally {
      setEditingLoading(false);
    }
  };

  const handleEditSuccess = (updatedOrder) => {
    setEditOrder(null);

    if (updatedOrder?.id) {
      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        ),
      );
    } else {
      fetchOrders();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" };

      // case "PENDING":
      //   return { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" };

      case "ORDERED":
        return { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" };

      // case "PARTIAL":
      //   return { bg: "#fefce8", text: "#a16207", border: "#fde68a" };

      case "RECEIVED":
        return { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };

      case "CANCELLED":
        return { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" };

      default:
        return { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" };
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString();
  };

  return (
    <div style={styles.page}>
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

      <div style={styles.actionBar}>
        <div style={styles.searchWrapper}>
          <Search size={18} color="#64748b" />

          <input
            type="text"
            placeholder="Search by ID or supplier..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
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
            {/* <option value="PENDING">Pending</option> */}
            <option value="ORDERED">Ordered</option>
            {/* <option value="PARTIAL">Partially Received</option> */}
            <option value="RECEIVED">Received</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div style={styles.summaryText}>
        Showing {orders.length} of {totalCount} total orders
      </div>

      {loading ? (
        <div style={styles.emptyCard}>Loading orders...</div>
      ) : error ? (
        <div style={styles.errorCard}>{error}</div>
      ) : orders.length === 0 ? (
        <div style={styles.emptyCard}>
          <Inbox size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />

          <h3 style={styles.emptyTitle}>No orders found</h3>

          <p style={styles.emptyText}>Adjust your search or filter criteria.</p>
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
              {orders.map((order, index) => {
                const isNearBottom =
                  index >= orders.length - 2 && orders.length > 3;

                const statusStyle = getStatusColor(order.status);

                const expectedDate =
                  order.expected_delivery ||
                  order.expected_delivery_date ||
                  order.delivery_date;

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
                        {order.supplier_name ||
                          order.supplier?.name ||
                          `Supplier #${order.supplier}`}
                      </strong>
                    </td>

                    <td style={styles.td}>{formatDate(order.order_date)}</td>

                    <td style={styles.td}>{formatDate(expectedDate)}</td>

                    <td style={styles.td}>
                      <span style={styles.itemPill}>
                        {order.item_count || order.items?.length || 0}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          border: `1px solid ${statusStyle.border}`,
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
                          type="button"
                          style={styles.iconButton}
                          onClick={() =>
                            setOpenMenu(openMenu === order.id ? null : order.id)
                          }
                          aria-label={`Actions for purchase order ${order.id}`}
                        >
                          <MoreVertical size={19} color="#334155" />
                        </button>

                        {openMenu === order.id && (
                          <>
                            <div
                              style={styles.dropdownOverlay}
                              onClick={() => setOpenMenu(null)}
                            />

                            <div
                              style={{
                                ...styles.dropdown,
                                top: isNearBottom ? "auto" : "calc(100% + 4px)",
                                bottom: isNearBottom
                                  ? "calc(100% + 4px)"
                                  : "auto",
                              }}
                            >
                              <button
                                type="button"
                                style={styles.dropdownItem}
                                onClick={() => handleOpenEdit(order)}
                              >
                                ✏️ Edit Order
                              </button>

                              <div style={styles.dropdownDivider} />

                              <button
                                type="button"
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

      {editingLoading && (
        <div style={styles.loadingOverlay}>Loading order details...</div>
      )}

      {totalCount > 0 && (
        <div style={styles.pagination}>
          <button
            disabled={!hasPrev}
            onClick={() => setCurrentPage((page) => page - 1)}
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
            onClick={() => setCurrentPage((page) => page + 1)}
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

      <EditPurchaseOrderModal
        order={editOrder}
        suppliers={suppliers}
        variants={variants}
        onClose={() => setEditOrder(null)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}

const styles = {
  page: {
    padding: "32px",
    background: "#f8fafc",
    minHeight: "100vh",
  },

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

  subtitle: {
    marginTop: "6px",
    color: "#64748b",
    fontSize: "15px",
  },

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
  },

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
    padding: "7px 12px",
    borderRadius: "7px",
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

  summaryText: {
    marginBottom: "16px",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
  },

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

  tr: {
    borderBottom: "1px solid #f1f5f9",
  },

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

  iconButton: {
    background: "#f8fafc",
    border: "1px solid #cbd5e1",
    color: "#334155",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "7px",
    borderRadius: "8px",
  },

  dropdownOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 90,
  },

  dropdown: {
    position: "absolute",
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
    color: "#334155",
    fontSize: "14px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: "6px",
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
  },

  emptyTitle: {
    margin: "0 0 8px",
    color: "#0f172a",
  },

  emptyText: {
    margin: 0,
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

  loadingOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9998,
    background: "rgba(15,23,42,0.35)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },
};
