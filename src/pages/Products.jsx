import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../libs/api";
import {
  Search,
  Plus,
  Package,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";
import ActionButtons from "../components/common/ActionButtons";
import DeleteConfirmModal from "../components/common/DeleteConfirmModal";
import EditModal from "../components/common/EditModal";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    type: "",
    name: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Edit Modal State
  const [editModal, setEditModal] = useState({ isOpen: false, variant: null });
  const [editForm, setEditForm] = useState({
    wholesale_price: "",
    retail_price: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [expandedRowId, setExpandedRowId] = useState(null);

  const executeSearch = () => {
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
    fetchCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeSearch]);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `products/catalog/?page=${currentPage}&search=${activeSearch}`,
      );
      setProducts(response.data.results || response.data);
      setTotalProducts(response.data.count || 0);
      setHasNext(!!response.data.next);
      setHasPrev(!!response.data.previous);
    } catch (err) {
      setError("Failed to load product catalog.");
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (productId) => {
    setExpandedRowId((prev) => (prev === productId ? null : productId));
  };

  // --- ACTION HANDLERS ---
  const handleEditProduct = (productId) => {
    // console.log("Navigate to edit screen for product:", productId);
    navigate(`/products/edit/${productId}`); // We will build this page later!
  };

  const confirmDeleteProduct = (product) => {
    setDeleteError(null);
    setDeleteModal({
      isOpen: true,
      id: product.id,
      type: "Product",
      name: product.name,
    });
  };

  const handleEditVariantClick = (variant) => {
    setEditForm({
      wholesale_price: variant.wholesale_price,
      retail_price: variant.retail_price,
    });
    setEditModal({ isOpen: true, variant: variant });
    setEditError(null);
  };

  const handleSaveVariant = async () => {
    setIsSaving(true);
    try {
      await api.patch(`products/variants/${editModal.variant.id}/`, {
        wholesale_price: editForm.wholesale_price,
        retail_price: editForm.retail_price,
      });
      setEditModal({ ...editModal, isOpen: false });
      fetchCatalog(); // Refresh table
    } catch (err) {
      setEditError("Failed to update prices. Please check your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteVariant = (variant) => {
    setDeleteError(null);
    setDeleteModal({
      isOpen: true,
      id: variant.id,
      type: "Variant",
      name: `SKU: ${variant.sku}`,
    });
  };
  const executeDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      if (deleteModal.type === "Product") {
        await api.delete(`products/catalog/${deleteModal.id}/`);
      } else {
        await api.delete(`products/variants/${deleteModal.id}/`);
      }
      setDeleteModal({ ...deleteModal, isOpen: false });
      fetchCatalog(); // Refresh the list
    } catch (err) {
      setDeleteError(
        "Cannot delete this item. It may be tied to existing inventory or sales records.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Product Catalog</h1>
          <p style={styles.pageSubtitle}>
            Manage your master products and variants.
          </p>
        </div>

        <Link to="/products/add" style={{ textDecoration: "none" }}>
          <button style={styles.addButton}>
            <Plus size={18} /> Add Product
          </button>
        </Link>
      </div>

      {/* STATS & SEARCH ROW */}
      <div style={styles.actionRow}>
        <div style={styles.statsPill}>
          <Layers size={18} color="#2563eb" />
          <span style={styles.statsText}>
            <strong>{totalProducts}</strong> Total Products
          </span>
        </div>

        <div style={styles.searchWrapper}>
          <Search size={18} color="#64748b" style={{ marginLeft: "12px" }} />
          <input
            type="text"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.searchInput}
          />
          <button onClick={executeSearch} style={styles.searchActionBtn}>
            Search
          </button>
        </div>
      </div>

      {/* MAIN TABLE */}
      {loading && products.length === 0 ? (
        <div style={styles.emptyCard}>Loading catalog...</div>
      ) : error ? (
        <div style={styles.errorCard}>{error}</div>
      ) : products.length === 0 ? (
        <div style={styles.emptyCard}>
          <Package size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
          <h3 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>
            No products found
          </h3>
        </div>
      ) : (
        <div
          style={{
            ...styles.tableContainer,
            opacity: loading ? 0.6 : 1,
            transition: "opacity 0.2s",
          }}
        >
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Product Name</th>
                <th style={styles.th}>Brand</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Variants</th>
                <th style={{ ...styles.th, textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <React.Fragment key={product.id}>
                  {/* PARENT ROW */}
                  <tr
                    style={{
                      ...styles.tr,
                      ...(expandedRowId === product.id
                        ? styles.trExpanded
                        : {}),
                    }}
                    onClick={() => toggleRow(product.id)}
                  >
                    <td style={styles.td}>
                      <strong style={{ color: "#0f172a", fontSize: "15px" }}>
                        {product.name}
                      </strong>
                    </td>
                    <td style={styles.td}>{product.brand_name || "—"}</td>
                    <td style={styles.td}>{product.category_name || "—"}</td>
                    <td style={styles.td}>
                      <span style={styles.variantBadge}>
                        {product.variants.length}
                      </span>
                    </td>

                    {/* UPDATED: PARENT ACTIONS */}
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "16px",
                        }}
                      >
                        <ActionButtons
                          itemName="product"
                          onEdit={() => handleEditProduct(product.id)}
                          onDelete={() => confirmDeleteProduct(product)}
                        />
                        <button style={styles.expandBtn}>
                          {expandedRowId === product.id ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* NESTED VARIANTS ROW */}
                  {expandedRowId === product.id && (
                    <tr>
                      <td colSpan="5" style={styles.nestedTd}>
                        <div style={styles.nestedContainer}>
                          {product.variants.length === 0 ? (
                            <div style={styles.noVariants}>
                              No variants available.
                            </div>
                          ) : (
                            <table style={styles.nestedTable}>
                              <thead>
                                <tr>
                                  <th style={styles.nestedTh}>SKU</th>
                                  <th style={styles.nestedTh}>Color</th>
                                  <th style={styles.nestedTh}>Size</th>
                                  <th style={styles.nestedTh}>Wholesale</th>
                                  <th style={styles.nestedTh}>Retail</th>
                                  {/* UPDATED: NESTED HEADER */}
                                  <th
                                    style={{
                                      ...styles.nestedTh,
                                      textAlign: "center",
                                    }}
                                  >
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {product.variants.map((variant) => (
                                  <tr key={variant.id} style={styles.nestedTr}>
                                    <td
                                      style={{
                                        ...styles.nestedTdCell,
                                        fontFamily: "monospace",
                                        color: "#475569",
                                      }}
                                    >
                                      {variant.sku}
                                    </td>
                                    <td style={styles.nestedTdCell}>
                                      {variant.color}
                                    </td>
                                    <td style={styles.nestedTdCell}>
                                      {variant.size}
                                    </td>
                                    <td
                                      style={{
                                        ...styles.nestedTdCell,
                                        color: "#2563eb",
                                        fontWeight: "600",
                                      }}
                                    >
                                      $
                                      {Number(variant.wholesale_price).toFixed(
                                        2,
                                      )}
                                    </td>
                                    <td
                                      style={{
                                        ...styles.nestedTdCell,
                                        color: "#16a34a",
                                        fontWeight: "600",
                                      }}
                                    >
                                      ${Number(variant.retail_price).toFixed(2)}
                                    </td>
                                    {/* UPDATED: NESTED ACTIONS */}
                                    <td
                                      style={{
                                        ...styles.nestedTdCell,
                                        textAlign: "center",
                                      }}
                                    >
                                      <ActionButtons
                                        itemName="variant"
                                        onEdit={() =>
                                          handleEditVariantClick(variant)
                                        }
                                        onDelete={() =>
                                          confirmDeleteVariant(variant)
                                        }
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {totalProducts > 0 && (
        <div style={styles.pagination}>
          <button
            disabled={!hasPrev || loading}
            onClick={() => setCurrentPage((p) => p - 1)}
            style={{
              ...styles.pageBtn,
              opacity: !hasPrev || loading ? 0.5 : 1,
            }}
          >
            &larr; Previous
          </button>
          <div style={styles.pageInfo}>Page {currentPage}</div>
          <button
            disabled={!hasNext || loading}
            onClick={() => setCurrentPage((p) => p + 1)}
            style={{
              ...styles.pageBtn,
              opacity: !hasNext || loading ? 0.5 : 1,
            }}
          >
            Next &rarr;
          </button>
        </div>
      )}
      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={executeDelete}
        itemName={deleteModal.name}
        itemType={deleteModal.type}
        loading={isDeleting}
        error={deleteError}
      />

      {/* EDIT VARIANT PRICE MODAL */}
      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ ...editModal, isOpen: false })}
        onSave={handleSaveVariant}
        loading={isSaving}
        error={editError}
        title={`Edit Price: ${editModal.variant?.sku || ""}`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#475569",
                marginBottom: "6px",
                display: "block",
              }}
            >
              Wholesale Price ($)
            </label>
            <input
              type="number"
              value={editForm.wholesale_price}
              onChange={(e) =>
                setEditForm({ ...editForm, wholesale_price: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#475569",
                marginBottom: "6px",
                display: "block",
              }}
            >
              Retail Price ($)
            </label>
            <input
              type="number"
              value={editForm.retail_price}
              onChange={(e) =>
                setEditForm({ ...editForm, retail_price: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </EditModal>
    </div>
  );
}

const styles = {
  page: { padding: "32px", background: "#f8fafc", minHeight: "100vh" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "16px",
  },
  pageTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  pageSubtitle: { marginTop: "6px", color: "#64748b", fontSize: "15px" },
  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },

  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "24px",
  },
  statsPill: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#eff6ff",
    padding: "10px 20px",
    borderRadius: "12px",
    border: "1px solid #bfdbfe",
  },
  statsText: { color: "#1e3a8a", fontSize: "14px" },

  searchWrapper: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    flex: "1 1 300px",
    maxWidth: "500px",
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    color: "#0f172a",
    background: "transparent",
  },
  searchActionBtn: {
    background: "#f8fafc",
    border: "none",
    borderLeft: "1px solid #cbd5e1",
    padding: "0 20px",
    alignSelf: "stretch",
    fontWeight: "600",

    fontWeight: "600",
    color: "#334155",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background 0.2s",
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
  tr: {
    borderBottom: "1px solid #f1f5f9",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  trExpanded: { background: "#f8fafc" },
  td: {
    padding: "16px 20px",
    color: "#475569",
    fontSize: "14px",
    verticalAlign: "middle",
  },

  variantBadge: {
    background: "#f1f5f9",
    color: "#475569",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },
  expandBtn: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },

  nestedTd: { padding: 0, borderBottom: "1px solid #e2e8f0" },
  nestedContainer: {
    background: "#f8fafc",
    padding: "16px 40px 24px 40px",
    borderLeft: "4px solid #2563eb",
  },
  nestedTable: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },
  nestedTh: {
    padding: "12px 16px",
    borderBottom: "1px solid #e2e8f0",
    color: "#64748b",
    fontWeight: "600",
    fontSize: "12px",
    textTransform: "uppercase",
    background: "#f1f5f9",
  },
  nestedTr: { borderBottom: "1px solid #f1f5f9" },
  nestedTdCell: { padding: "12px 16px", color: "#475569", fontSize: "13px" },
  noVariants: { color: "#94a3b8", fontSize: "14px", fontStyle: "italic" },

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
    transition: "opacity 0.2s",
  },
  pageInfo: { fontSize: "15px", fontWeight: "600", color: "#0f172a" },
};
