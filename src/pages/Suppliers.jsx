import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import DeleteSupplierModal from "./DeleteSupplier";
import EditSupplierModal from "./EditSupplier";
import api from "../libs/api";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [deleteSupplier, setDeleteSupplier] = useState(null);
  // const [editSuppier, setEditSupplier] = useState(null);
  const [editSupplier, setEditSupplier] = useState(null);

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalSuppliers, setTotalSuppliers] = useState(0);

  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const executeSearch = () => {
    setActiveSearch(search);
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      executeSearch();
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [currentPage, activeSearch]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("purchasing/suppliers/", {
        params: {
          page: currentPage,
          search: activeSearch,
        },
      });

      const data = await response.data;

      setSuppliers(data.results || data || []);
      setTotalSuppliers(data.count || 0);

      setHasNext(Boolean(data.next));
      setHasPrev(Boolean(data.previous));
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);

      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Unable to load suppliers.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSuccess = () => {
    // 1. Remove the deleted supplier from the current page's list
    setSuppliers((prevSuppliers) =>
      prevSuppliers.filter((s) => s.id !== deleteSupplier.id),
    );

    // 2. Decrement the total count
    setTotalSuppliers((prevTotal) => prevTotal - 1);

    // 3. Clear the state to close the modal
    setDeleteSupplier(null);
  };

  const handleEditSuccess = (updatedSupplier) => {
    // 1. Close the modal immediately so the user can see the table
    setEditSupplier(null);
    if (updatedSupplier?.id) {
      setSuppliers((prevSuppliers) =>
        prevSuppliers.map((supplier) =>
          supplier.id === updatedSupplier.id ? updatedSupplier : supplier,
        ),
      );
    } else {
      fetchSuppliers();
    }

    // 3. Clear the state to close the modal
    setEditSupplier(null);
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Suppliers</h1>
          <p style={styles.subtitle}>
            Manage your vendors and warehouse partners.
          </p>
        </div>

        <Link to="/purchasing/suppliers/add" style={{ textDecoration: "none" }}>
          <button style={styles.addButton}>
            <Plus size={18} />
            Add Supplier
          </button>
        </Link>
      </div>

      {/* STATS */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <Users size={22} />
          </div>

          <div>
            <div style={styles.statNumber}>{totalSuppliers}</div>
            <div style={styles.statLabel}>Total Suppliers</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statNumber}>{suppliers.length}</div>
          <div style={styles.statLabel}>Current Page Results</div>
        </div>
      </div>

      {/* SEARCH */}
      <div style={styles.searchContainer}>
        <div style={styles.searchWrapper}>
          <Search size={18} color="#64748b" />

          <input
            type="text"
            placeholder="Search supplier, contact, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.searchInput}
          />
        </div>

        <button onClick={executeSearch} style={styles.searchButton}>
          Search
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div style={styles.emptyCard}>Loading suppliers...</div>
      ) : error ? (
        <div style={styles.errorCard}>{error}</div>
      ) : suppliers.length === 0 ? (
        <div style={styles.emptyCard}>No suppliers found.</div>
      ) : (
        <div style={styles.cardGrid}>
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              style={styles.supplierCard}
              className="supplier-card"
            >
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.supplierName}>{supplier.name}</h3>

                  <div style={styles.address}>
                    <MapPin size={14} />
                    {supplier.address || "No address"}
                  </div>
                </div>

                <div style={{ position: "relative" }}>
                  <button
                    style={styles.actionButton}
                    onClick={() =>
                      setOpenMenu(openMenu === supplier.id ? null : supplier.id)
                    }
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openMenu === supplier.id && (
                    <div style={styles.dropdown}>
                      <button
                        style={{
                          ...styles.dropdownItem,
                          color: "#8fc511",
                        }}
                        onClick={() => {
                          setEditSupplier(supplier);
                          setOpenMenu(null);
                        }}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        style={{
                          ...styles.dropdownItem,
                          color: "#dc2626",
                        }}
                        onClick={() => {
                          setDeleteSupplier(supplier);
                          setOpenMenu(null);
                        }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.divider}></div>

              <div style={styles.contactSection}>
                <div style={styles.contactRow}>
                  👤 {supplier.contact_name || "No Contact Assigned"}
                </div>

                <div style={styles.contactRow}>
                  <Mail size={15} />
                  {supplier.email || "-"}
                </div>

                <div style={styles.contactRow}>
                  <Phone size={15} />
                  {supplier.phone || "-"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <div style={styles.pagination}>
        <button
          disabled={!hasPrev}
          onClick={() => setCurrentPage((p) => p - 1)}
          style={{
            ...styles.paginationButton,
            opacity: !hasPrev ? 0.5 : 1,
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
          }}
        >
          Next →
        </button>
      </div>
      {/* DELETE MODAL */}
      <DeleteSupplierModal
        supplier={deleteSupplier}
        onClose={() => setDeleteSupplier(null)}
        onSuccess={handleDeleteSuccess}
      />

      {/* Edit MODAL */}
      <EditSupplierModal
        supplier={editSupplier}
        onClose={() => setEditSupplier(null)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}

const styles = {
  page: {
    padding: "24px",
    background: "#f8fafc",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "700",
    color: "#0f172a",
  },

  subtitle: {
    marginTop: "6px",
    color: "#64748b",
  },

  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg,#2563eb,#3b82f6)",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(37,99,235,.25)",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: "16px",
    marginBottom: "24px",
  },

  statCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "20px",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 2px 8px rgba(0,0,0,.04)",
  },

  statIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "14px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563eb",
  },

  statNumber: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
  },

  statLabel: {
    color: "#64748b",
    fontSize: "14px",
  },

  searchContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "24px",
  },

  searchWrapper: {
    flex: "1 1 300px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "0 16px",
    minHeight: "54px",
  },

  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "15px",
    background: "transparent",
    color: "#0f172a",
  },

  searchButton: {
    minWidth: "130px",
    height: "54px",
    border: "none",
    borderRadius: "14px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
    gap: "20px",
  },

  supplierCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "20px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,.04)",
    transition: "all .2s ease",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  supplierName: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
  },

  address: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "6px",
    color: "#64748b",
    fontSize: "14px",
  },

  divider: {
    height: "1px",
    background: "#e5e7eb",
    margin: "16px 0",
  },

  contactSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  contactRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#475569",
    fontSize: "14px",
  },

  actionButton: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCard: {
    background: "#fff",
    padding: "40px",
    borderRadius: "18px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },

  errorCard: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "20px",
    borderRadius: "18px",
    border: "1px solid #fecaca",
  },

  pagination: {
    marginTop: "24px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },

  paginationButton: {
    minWidth: "120px",
    height: "42px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#635b5b",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  },

  pageInfo: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
  },
  dropdown: {
    position: "absolute",
    top: "45px",
    right: 0,
    width: "160px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,.08)",
    overflow: "hidden",
    zIndex: 100,
  },

  dropdownItem: {
    width: "100%",
    padding: "12px 16px",
    border: "none",
    background: "transparent",
    textAlign: "left",
    cursor: "pointer",
    textDecoration: "none",
    color: "#334155",
    display: "block",
  },
};
