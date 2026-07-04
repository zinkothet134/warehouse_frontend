import React, { useEffect, useState } from "react";
import api from "../libs/api";
import {
  DollarSign,
  Mail,
  Phone,
  Search,
  ShoppingBag,
  Users,
} from "lucide-react";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDate = (dateValue) => {
  if (!dateValue) return "—";

  return new Date(dateValue).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, activeSearch]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/sales/customers/", {
        params: {
          page: currentPage,
          search: activeSearch,
        },
      });

      const responseData = response.data;
      const results = Array.isArray(responseData)
        ? responseData
        : responseData.results || [];

      setCustomers(results);
      setTotalCount(
        Array.isArray(responseData) ? results.length : responseData.count || 0,
      );
      setHasNext(Boolean(responseData.next));
      setHasPrev(Boolean(responseData.previous));
    } catch (err) {
      console.error("Could not load customers:", err);
      setCustomers([]);
      setError("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setActiveSearch(search.trim());
  };

  const clearSearch = () => {
    setSearch("");
    setActiveSearch("");
    setCurrentPage(1);
  };

  const totalOrdersOnPage = customers.reduce(
    (total, customer) => total + Number(customer.total_orders || 0),
    0,
  );

  const totalSpentOnPage = customers.reduce(
    (total, customer) => total + Number(customer.total_spent || 0),
    0,
  );

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Customer management</p>
          <h1 style={styles.title}>Customers</h1>
          <p style={styles.subtitle}>
            Review customer details, completed orders, and total purchase value.
          </p>
        </div>
      </header>

      <section style={styles.summaryGrid}>
        <article style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, ...styles.blueIcon }}>
            <Users size={20} />
          </div>

          <div>
            <p style={styles.summaryLabel}>Customers</p>
            <strong style={styles.summaryValue}>{totalCount}</strong>
          </div>
        </article>

        <article style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, ...styles.tealIcon }}>
            <ShoppingBag size={20} />
          </div>

          <div>
            <p style={styles.summaryLabel}>Orders on this page</p>
            <strong style={styles.summaryValue}>{totalOrdersOnPage}</strong>
          </div>
        </article>

        <article style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, ...styles.greenIcon }}>
            <DollarSign size={20} />
          </div>

          <div>
            <p style={styles.summaryLabel}>Spent on this page</p>
            <strong style={styles.summaryValue}>
              {formatMoney(totalSpentOnPage)}
            </strong>
          </div>
        </article>
      </section>

      <section style={styles.actionBar}>
        <div style={styles.searchWrapper}>
          <Search size={18} color="#64748b" />

          <input
            type="text"
            placeholder="Search name, email, or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearch();
            }}
            style={styles.searchInput}
          />

          {activeSearch && (
            <button
              type="button"
              onClick={clearSearch}
              style={styles.clearButton}
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={handleSearch}
            style={styles.searchButton}
          >
            Search
          </button>
        </div>
      </section>

      {loading && customers.length === 0 ? (
        <div style={styles.emptyCard}>Loading customers...</div>
      ) : error ? (
        <div style={styles.errorCard}>{error}</div>
      ) : customers.length === 0 ? (
        <div style={styles.emptyCard}>
          <Users size={48} color="#cbd5e1" />

          <h3 style={styles.emptyTitle}>No customers found</h3>

          <p style={styles.emptyText}>
            Completed sales with customer details will appear here.
          </p>
        </div>
      ) : (
        <section style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Completed Orders</th>
                <th style={styles.th}>Total Spent</th>
                <th style={styles.th}>Joined</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong style={styles.customerName}>{customer.name}</strong>
                  </td>

                  <td style={styles.td}>
                    <div style={styles.contactGroup}>
                      <span style={styles.contactRow}>
                        <Mail size={14} />
                        {customer.email || "No email"}
                      </span>

                      <span style={styles.contactRow}>
                        <Phone size={14} />
                        {customer.phone || "No phone"}
                      </span>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <span style={styles.orderPill}>
                      {Number(customer.total_orders ?? 0)}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <strong style={styles.totalSpent}>
                      {formatMoney(customer.total_spent)}
                    </strong>
                  </td>

                  <td style={styles.td}>{formatDate(customer.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {totalCount > 0 && (
        <nav style={styles.pagination}>
          <button
            type="button"
            disabled={!hasPrev || loading}
            onClick={() => setCurrentPage((page) => page - 1)}
            style={{
              ...styles.pageButton,
              opacity: !hasPrev || loading ? 0.5 : 1,
              cursor: !hasPrev || loading ? "not-allowed" : "pointer",
            }}
          >
            ← Previous
          </button>

          <span style={styles.pageInfo}>
            Page {currentPage} · {totalCount} customers
          </span>

          <button
            type="button"
            disabled={!hasNext || loading}
            onClick={() => setCurrentPage((page) => page + 1)}
            style={{
              ...styles.pageButton,
              opacity: !hasNext || loading ? 0.5 : 1,
              cursor: !hasNext || loading ? "not-allowed" : "pointer",
            }}
          >
            Next →
          </button>
        </nav>
      )}
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px",
    background: "#f8fafc",
  },

  header: {
    marginBottom: "24px",
  },

  eyebrow: {
    margin: 0,
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },

  title: {
    margin: "6px 0 0",
    color: "#0f172a",
    fontSize: "30px",
    fontWeight: "800",
    letterSpacing: "-0.6px",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "15px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },

  summaryCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "18px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    boxShadow: "0 2px 5px rgba(15, 23, 42, 0.03)",
  },

  summaryIcon: {
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
  },

  blueIcon: {
    color: "#2563eb",
    background: "#dbeafe",
  },

  tealIcon: {
    color: "#0f766e",
    background: "#ccfbf1",
  },

  greenIcon: {
    color: "#15803d",
    background: "#dcfce7",
  },

  summaryLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "700",
  },

  summaryValue: {
    display: "block",
    marginTop: "4px",
    color: "#0f172a",
    fontSize: "21px",
  },

  actionBar: {
    marginBottom: "22px",
  },

  searchWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    maxWidth: "680px",
    padding: "8px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "11px",
    background: "#ffffff",
  },

  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#0f172a",
    fontSize: "14px",
  },

  searchButton: {
    border: "none",
    borderRadius: "7px",
    padding: "8px 13px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },

  clearButton: {
    border: "none",
    padding: "7px 8px",
    background: "transparent",
    color: "#64748b",
    fontWeight: "700",
    cursor: "pointer",
  },

  tableContainer: {
    overflowX: "auto",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    background: "#ffffff",
    boxShadow: "0 3px 8px rgba(15, 23, 42, 0.03)",
  },

  table: {
    width: "100%",
    minWidth: "820px",
    borderCollapse: "collapse",
    textAlign: "left",
  },

  th: {
    padding: "15px 20px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
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

  customerName: {
    color: "#0f172a",
    fontSize: "15px",
  },

  contactGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  contactRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#64748b",
    fontSize: "13px",
  },

  orderPill: {
    display: "inline-flex",
    minWidth: "28px",
    justifyContent: "center",
    padding: "5px 10px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: "800",
  },

  totalSpent: {
    color: "#15803d",
    fontSize: "15px",
  },

  emptyCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "64px 20px",
    border: "1px dashed #cbd5e1",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#64748b",
    textAlign: "center",
  },

  emptyTitle: {
    margin: "16px 0 6px",
    color: "#0f172a",
  },

  emptyText: {
    margin: 0,
    fontSize: "14px",
  },

  errorCard: {
    padding: "18px",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontWeight: "600",
  },

  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "22px",
    padding: "14px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    background: "#ffffff",
  },

  pageButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "8px 14px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: "700",
  },

  pageInfo: {
    color: "#475569",
    fontSize: "14px",
    fontWeight: "700",
  },
};
