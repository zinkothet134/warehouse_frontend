import React, { useState, useEffect, useMemo } from "react";
import api from "../libs/api";
import { Search, Package, AlertCircle } from "lucide-react";
import "../assets/common/POS.css";
import CutomerInfoModal from "../components/sales/CustomerInfoModal";
import Toast from "../components/common/Toast";

import SkuScannerModal from "../components/sales/SkuScannerModal";

export default function POS() {
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Search State
  const [activeSearch, setActiveSearch] = useState("");
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerDetails, setCustomerDetails] = useState({
    email: "",
    phone: "",
    address: "",
  });
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [saleMode, setSaleMode] = useState("RETAIL");
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [checkoutError, setCheckoutError] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Helper function to trigger the toast
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

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
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `products/variants/?page=${currentPage}&search=${activeSearch}`,
        );
        setVariants(response.data.results || response.data);
        setHasNext(!!response.data.next);
        setHasPrev(!!response.data.previous);
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [currentPage, activeSearch]);

  const addScannedItemToCart = ({
    variant,
    quantity,
    saleMode: scannedSaleMode,
  }) => {
    const selectedPrice = Number(
      scannedSaleMode === "WHOLESALE"
        ? variant.wholesale_price
        : variant.retail_price,
    );

    setCart((prev) => {
      const existing = prev.find((item) => item.variant === variant.id);

      if (existing) {
        return prev.map((item) =>
          item.variant === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...prev,
        {
          variant: variant.id,

          sku: variant.sku,

          name: variant.product_name,

          display_info: `${variant.color} - Size ${variant.size}`,

          retail_price: Number(variant.retail_price),

          wholesale_price: Number(variant.wholesale_price),

          price_at_sale: selectedPrice,

          quantity,
        },
      ];
    });

    setSaleMode(scannedSaleMode);
    showToast(`${variant.product_name} added to cart.`, "success");
    setIsScannerOpen(false);
  };

  const addToCart = (variant) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.variant === variant.id);
      if (existing) {
        return prev.map((item) =>
          item.variant === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          variant: variant.id,

          sku: variant.sku,

          name: variant.product_name,

          display_info: `${variant.color} - Size ${variant.size}`,

          retail_price: Number(variant.retail_price),

          wholesale_price: Number(variant.wholesale_price),

          price_at_sale:
            saleMode === "WHOLESALE"
              ? Number(variant.wholesale_price)
              : Number(variant.retail_price),

          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (variantId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.variant === variantId) {
            const qty = item.quantity + delta;
            return { ...item, quantity: qty > 0 ? qty : 0 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.price_at_sale,
    0,
  );
  const changeSaleMode = (nextSaleMode) => {
    if (nextSaleMode === saleMode) return;

    setCart((prev) =>
      prev.map((item) => ({
        ...item,

        price_at_sale: Number(
          nextSaleMode === "WHOLESALE"
            ? item.wholesale_price
            : item.retail_price,
        ),
      })),
    );

    setSaleMode(nextSaleMode);

    showToast(
      `Cart prices changed to ${nextSaleMode.toLowerCase()} prices.`,

      "success",
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutError(null);
    setIsCheckingOut(true);

    try {
      await api.post("sales/orders/", {
        customer_name: customerName,

        customer_email: customerDetails.email,

        customer_phone: customerDetails.phone,

        customer_address: customerDetails.address,

        order_type: saleMode, // RETAIL or WHOLESALE

        payment_method: paymentMethod,

        items: cart.map((item) => ({
          variant: item.variant,

          quantity: item.quantity,

          price_at_sale: item.price_at_sale,
        })),
      });

      showToast("Sale completed successfully!", "success");
      setCart([]);
      setCustomerName("");
      setCustomerDetails({ email: "", phone: "", address: "" });
      setPaymentMethod("CARD");
    } catch (err) {
      const backendError = err.response?.data?.[0] || "Checkout failed.";
      setCheckoutError(backendError);
      showToast("Checkout failed. Please try again.", "error");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading && variants.length === 0) {
    return <div style={styles.loading}>Loading POS Terminal...</div>;
  }

  return (
    <div style={styles.page}>
      {/* PRODUCTS PANEL */}
      <div style={styles.productsPanel}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Point of Sale</h1>
            <p style={styles.subtitle}>
              Select products to add to the {saleMode.toLowerCase()} cart
            </p>
          </div>
          <div style={styles.headerActions}>
            <div style={styles.saleModeToggle}>
              <button
                type="button"
                onClick={() => changeSaleMode("RETAIL")}
                style={{
                  ...styles.saleModeBtn,
                  ...(saleMode === "RETAIL" ? styles.saleModeBtnActive : {}),
                }}
              >
                Retail
              </button>
              <button
                type="button"
                onClick={() => changeSaleMode("WHOLESALE")}
                style={{
                  ...styles.saleModeBtn,
                  ...(saleMode === "WHOLESALE" ? styles.saleModeBtnActive : {}),
                }}
              >
                Wholesale
              </button>
            </div>
            <div style={styles.summaryBadge}>{totalItems} Items in Cart</div>
          </div>
        </div>

        {/* SEARCH */}
        <div style={styles.searchAndScanRow}>
          <div style={styles.searchWrapper}>
            <Search size={18} color="#64748b" style={{ marginLeft: "12px" }} />
            <input
              type="text"
              placeholder="Search SKU, product, color, or size..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.searchInput}
              autoFocus
            />
            <button
              type="button"
              onClick={executeSearch}
              style={styles.searchActionBtn}
            >
              Search
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            style={styles.scanBtn}
          >
            Scan barcode
          </button>
        </div>

        {/* PRODUCT GRID */}
        <div
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.2s",
            flex: 1,
            overflowY: "auto",
            paddingRight: "8px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {variants.length === 0 && !loading ? (
            <div style={styles.emptyState}>
              <Package
                size={48}
                color="#cbd5e1"
                style={{ marginBottom: "16px" }}
              />
              <h3 style={styles.emptyStateTitle}>No products found</h3>
              <p style={styles.emptyStateText}>
                Try adjusting your search or scan a different barcode.
              </p>
            </div>
          ) : (
            <div style={styles.productGrid}>
              {variants.map((v) => {
                const stockLevel = v.stock || 0;
                const isOutOfStock = stockLevel <= 0;

                return (
                  <div
                    key={v.id}
                    style={{
                      ...styles.productCard,
                      opacity: isOutOfStock ? 0.6 : 1,
                      cursor: isOutOfStock ? "not-allowed" : "pointer",
                      border: isOutOfStock
                        ? "1px solid #e2e8f0"
                        : "1px solid #bfdbfe",
                    }}
                    onClick={() => !isOutOfStock && addToCart(v)}
                  >
                    <div style={styles.cardHeader}>
                      <div style={styles.productName}>
                        {v.product_name || "Unknown Product"}
                      </div>
                      <div style={styles.skuText}>{v.sku}</div>
                    </div>

                    <div style={styles.badgeRow}>
                      <span style={styles.variantBadge}>{v.color}</span>
                      <span style={styles.variantBadge}>Size {v.size}</span>
                    </div>

                    <div style={styles.cardFooter}>
                      <div style={styles.price}>
                        $
                        {Number(
                          saleMode === "WHOLESALE"
                            ? v.wholesale_price
                            : v.retail_price,
                        ).toFixed(2)}
                      </div>

                      <div
                        style={
                          stockLevel > 5
                            ? styles.stockGood
                            : stockLevel > 0
                              ? styles.stockLow
                              : styles.stockOut
                        }
                      >
                        {stockLevel > 0 ? (
                          <>
                            <Package size={14} /> {stockLevel} in stock
                          </>
                        ) : (
                          <>
                            <AlertCircle size={14} /> Out of stock
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 🌟 RESTORED PAGINATION CONTROLS 🌟 */}
          <div style={styles.paginationControls}>
            <button
              style={{
                ...styles.pageBtn,
                opacity: !hasPrev || loading ? 0.5 : 1,
              }}
              disabled={!hasPrev || loading}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              &larr; Previous
            </button>
            <span style={styles.pageIndicator}>Page {currentPage}</span>
            <button
              style={{
                ...styles.pageBtn,
                opacity: !hasNext || loading ? 0.5 : 1,
              }}
              disabled={!hasNext || loading}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* CART PANEL */}
      <div style={styles.cartPanel}>
        <h2 style={styles.cartTitle}>
          Current Order{" "}
          <strong style={styles.saleModeLabel}>
            ({saleMode === "WHOLESALE" ? "Wholesale" : "Retail"})
          </strong>
        </h2>
        <div style={styles.cartItems}>
          {cart.length === 0 ? (
            <div style={styles.emptyCart}>Cart is empty</div>
          ) : (
            cart.map((item) => (
              <div key={item.variant} style={styles.cartItem}>
                <div style={{ flex: 1, paddingRight: "10px" }}>
                  <div style={styles.cartName}>{item.name}</div>
                  <div style={styles.cartSku}>{item.sku}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {item.display_info}
                  </div>
                  <div style={styles.cartUnitPrice}>
                    {saleMode === "WHOLESALE" ? "Wholesale" : "Retail"} · $
                    {Number(item.price_at_sale).toFixed(2)} each
                  </div>
                </div>
                <div style={styles.qtyBox}>
                  <button
                    style={styles.qtyBtn}
                    onClick={() => updateQuantity(item.variant, -1)}
                  >
                    −
                  </button>
                  <span style={styles.qtyText}>{item.quantity}</span>
                  <button
                    style={styles.qtyBtn}
                    onClick={() => updateQuantity(item.variant, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={styles.checkout}>
          <div style={styles.totalRow}>
            <span>Total</span>
            <span style={{ color: "#2563eb" }}>${cartTotal.toFixed(2)}</span>
          </div>

          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name (Optional)"
              style={{ ...styles.input, marginBottom: 0, flex: 1 }}
            />
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              style={{
                background: "#eff6ff",
                color: "#2563eb",
                border: "1px solid #bfdbfe",
                padding: "0 16px",
                borderRadius: "10px",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              + Details
            </button>
          </div>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={styles.input}
          >
            <option value="CARD">Card</option>
            <option value="CASH">Cash</option>
          </select>

          {checkoutError && <div style={styles.error}>{checkoutError}</div>}

          <button
            disabled={cart.length === 0 || isCheckingOut}
            onClick={handleCheckout}
            style={{
              ...styles.checkoutBtn,
              opacity: cart.length === 0 ? 0.6 : 1,
            }}
          >
            {isCheckingOut ? "Processing..." : "Complete Checkout"}
          </button>
        </div>
      </div>

      {/* CUSTOMER INFO MODAL */}
      <CutomerInfoModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        initialData={{ name: customerName, ...customerDetails }}
        onSave={(data) => {
          setCustomerName(data.name);
          setCustomerDetails({
            email: data.email,
            phone: data.phone,
            address: data.address,
          });
        }}
      />
      {/* SUCCESS/ERROR TOAST */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
      <SkuScannerModal
        isOpen={isScannerOpen}
        initialSaleMode={saleMode}
        onClose={() => setIsScannerOpen(false)}
        onAddToCart={addScannedItemToCart}
      />
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexWrap: "wrap",
    gap: "24px",
    padding: "24px",
    background: "#f8fafc",
    minHeight: "100vh",
    alignItems: "flex-start",
  },

  // 🌟 EXACT 1/3 LAYOUT FOR CART
  productsPanel: {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 60%",
    minWidth: "350px",
    background: "#f8fafc",
    height: "calc(100vh - 48px)",
    boxSizing: "border-box",
  },

  cartPanel: {
    flex: "1 1 320px", // Flexibly aims for ~1/3 width, but grows/shrinks as needed
    minWidth: "320px",
    maxWidth: "100%", // Ensures it scales nicely if it wraps to the next line on mobile
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    boxShadow:
      "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)",
    position: "sticky",
    top: "24px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  saleModeToggle: {
    display: "inline-flex",
    padding: "4px",
    borderRadius: "12px",
    background: "#e2e8f0",
    gap: "4px",
  },
  saleModeBtn: {
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    color: "#475569",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },
  saleModeBtnActive: {
    background: "#ffffff",
    color: "#2563eb",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.15)",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  subtitle: { margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" },
  summaryBadge: {
    background: "#1e293b",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "14px",
  },
  searchAndScanRow: {
    display: "flex",
    alignItems: "stretch",
    gap: "12px",
    marginBottom: "20px",
  },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    background: "#fff",
    borderRadius: "14px",
    border: "1px solid #dbe3ef",
    overflow: "hidden",
    boxShadow: "0 2px 4px rgba(15, 23, 42, 0.03)",
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    padding: "16px 12px",
    fontSize: "16px",
    color: "#0f172a",
    background: "transparent",
  },
  searchActionBtn: {
    background: "#f1f5f9",
    border: "none",
    borderLeft: "2px solid #e2e8f0",
    padding: "0 24px",
    alignSelf: "stretch",
    fontWeight: "700",
    color: "#334155",
    cursor: "pointer",
    fontSize: "15px",
    transition: "background 0.2s",
  },
  scanBtn: {
    flexShrink: 0,
    border: "none",
    borderRadius: "14px",
    background: "#2563eb",
    color: "#ffffff",
    padding: "0 20px",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(37, 99, 235, 0.22)",
  },

  // for search empty state
  // Add these alongside your other productGrid styles
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1, // Stretches to fill the empty space
    padding: "40px 20px",
    background: "#fff",
    borderRadius: "16px",
    border: "2px dashed #e2e8f0",
    textAlign: "center",
    marginTop: "20px",
  },
  emptyStateTitle: {
    margin: "0 0 8px 0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
  },
  emptyStateText: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
  },

  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "16px",
    paddingBottom: "24px",
  },
  productCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "16px",
    boxShadow:
      "0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -2px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    transition: "transform 0.1s, box-shadow 0.1s, border-color 0.2s",
  },
  cardHeader: { display: "flex", flexDirection: "column", gap: "2px" },
  productName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: "1.2",
  },
  skuText: {
    fontSize: "12px",
    color: "#94a3b8",
    fontFamily: "monospace",
    fontWeight: "600",
  },

  badgeRow: { display: "flex", gap: "6px", flexWrap: "wrap" },
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
    paddingTop: "8px",
  },
  price: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#2563eb",
    letterSpacing: "-0.5px",
  },

  stockGood: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "#dcfce7",
    color: "#166534",
    padding: "4px 8px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },
  stockLow: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "#fef08a",
    color: "#854d0e",
    padding: "4px 8px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },
  stockOut: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "4px 8px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },

  cartTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#0f172a",
    fontSize: "20px",
  },
  saleModeLabel: {
    color: "#2563eb",
    fontSize: "14px",
  },
  cartItems: { maxHeight: "420px", overflowY: "auto", paddingRight: "8px" },
  emptyCart: {
    textAlign: "center",
    color: "#94a3b8",
    padding: "40px 0",
    fontSize: "15px",
  },

  cartItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  cartSku: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: "15px",
    marginBottom: "4px",
  },
  cartName: { color: "#64748b", fontSize: "13px" },

  qtyBox: { display: "flex", alignItems: "center", gap: "12px" },
  qtyBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: "#f1f5f9",
    color: "#334155",
    fontWeight: "700",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.1s",
  },
  qtyText: {
    fontWeight: "600",
    width: "20px",
    textAlign: "center",
    color: "#0f172a",
  },

  checkout: { marginTop: "24px", paddingTop: "24px" },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: "24px",
  },
  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
    fontSize: "15px",
    outline: "none",
  },
  checkoutBtn: {
    width: "100%",
    border: "none",
    borderRadius: "12px",
    padding: "16px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "8px",
    boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
  },
  error: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "16px",
    fontSize: "14px",
    fontWeight: "500",
    border: "1px solid #fecaca",
  },
  loading: {
    padding: "60px",
    textAlign: "center",
    color: "#64748b",
    fontWeight: "500",
  },

  paginationControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto", // Pushes it to the bottom
    paddingTop: "16px",
    background: "#f8fafc",
  },
  pageBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    color: "#334155",
  },
  pageIndicator: { fontWeight: "600", color: "#0f172a" },
  cartUnitPrice: {
    marginTop: "4px",

    color: "#2563eb",

    fontSize: "12px",

    fontWeight: "700",
  },
};
