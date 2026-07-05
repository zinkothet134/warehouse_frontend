import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  PackagePlus,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import api from "../../libs/api";

const EMPTY_ITEM = {
  variant: "",
  quantity: 1,
  unit_cost: "",
};

const getSupplierId = (order) =>
  order?.supplier?.id || order?.supplier_id || order?.supplier || "";

const getItemVariantId = (item) =>
  item?.variant?.id || item?.variant_id || item?.variant || "";

const getItemUnitCost = (item) =>
  item?.unit_cost ??
  item?.unit_price ??
  item?.purchase_price ??
  item?.cost_price ??
  "";

const getItemQuantity = (item) => item?.quantity ?? 1;

export default function EditPurchaseOrderModal({
  order,
  suppliers = [],
  variants = [],
  onClose,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    supplier: "",
    status: "PENDING",
    order_date: "",
    expected_delivery_date: "",
    notes: "",
    items: [{ ...EMPTY_ITEM }],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!order) return;

    setFormData({
      supplier: getSupplierId(order),
      status: order.status || "PENDING",
      order_date: order.order_date || order.created_at?.slice(0, 10) || "",
      expected_delivery_date:
        order.expected_delivery_date ||
        order.delivery_date ||
        order.expected_date ||
        "",
      notes: order.notes || order.remark || "",
      items:
        order.items?.length > 0
          ? order.items.map((item) => ({
              id: item.id,
              variant: getItemVariantId(item),
              quantity: getItemQuantity(item),
              unit_cost: getItemUnitCost(item),
            }))
          : [{ ...EMPTY_ITEM }],
    });

    setError("");
  }, [order]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [loading, onClose]);

  const totalAmount = useMemo(() => {
    return formData.items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitCost = Number(item.unit_cost) || 0;

      return total + quantity * unitCost;
    }, 0);
  }, [formData.items]);

  if (!order) return null;

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData((previous) => ({
      ...previous,
      items: previous.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  };

  const addItem = () => {
    setFormData((previous) => ({
      ...previous,
      items: [...previous.items, { ...EMPTY_ITEM }],
    }));
  };

  const removeItem = (index) => {
    setFormData((previous) => {
      if (previous.items.length === 1) {
        return {
          ...previous,
          items: [{ ...EMPTY_ITEM }],
        };
      }

      return {
        ...previous,
        items: previous.items.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const validateForm = () => {
    if (!formData.supplier) {
      return "Please select a supplier.";
    }

    if (!formData.order_date) {
      return "Please select the purchase order date.";
    }

    if (formData.items.length === 0) {
      return "Please add at least one item.";
    }

    for (const item of formData.items) {
      if (!item.variant) {
        return "Please select a product variant for every item.";
      }

      if (!Number(item.quantity) || Number(item.quantity) <= 0) {
        return "Each item quantity must be greater than zero.";
      }

      if (Number(item.unit_cost) < 0) {
        return "Unit cost cannot be negative.";
      }
    }

    return "";
  };

  const handleSave = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        supplier: Number(formData.supplier),
        status: formData.status,
        order_date: formData.order_date,
        expected_delivery_date: formData.expected_delivery_date || null,
        notes: formData.notes,
        items: formData.items.map((item) => ({
          ...(item.id ? { id: item.id } : {}),
          variant: Number(item.variant),
          quantity: Number(item.quantity),
          unit_cost: Number(item.unit_cost) || 0,
        })),
      };

      const response = await api.patch(
        `purchasing/purchase-orders/${order.id}/`,
        payload,
      );

      onSuccess?.(response.data);
    } catch (err) {
      console.error("Unable to update purchase order:", err);

      const apiError =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Unable to update purchase order. Please try again.";

      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={styles.overlay}
      onClick={!loading ? onClose : undefined}
      role="presentation"
    >
      <div
        style={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Edit purchase order ${order.id}`}
      >
        <div style={styles.header}>
          <div style={styles.headingGroup}>
            <div style={styles.iconBox}>
              <Pencil size={21} color="#2563eb" />
            </div>

            <div>
              <h2 style={styles.title}>Edit Purchase Order</h2>
              <p style={styles.subtitle}>PO #{order.id}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={styles.closeButton}
            aria-label="Close edit purchase order modal"
          >
            <X size={20} />
          </button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.content}>
          <div style={styles.formGrid}>
            <label style={styles.fieldGroup}>
              <span style={styles.label}>Supplier</span>

              <select
                value={formData.supplier}
                onChange={(event) =>
                  updateField("supplier", event.target.value)
                }
                disabled={loading}
                style={styles.input}
              >
                <option value="">Select supplier</option>

                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={styles.fieldGroup}>
              <span style={styles.label}>Status</span>

              <select
                value={formData.status}
                onChange={(event) => updateField("status", event.target.value)}
                disabled={loading}
                style={styles.input}
              >
                <option value="PENDING">Pending</option>
                <option value="ORDERED">Ordered</option>
                <option value="PARTIAL">Partially Received</option>
                <option value="RECEIVED">Received</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </label>

            <label style={styles.fieldGroup}>
              <span style={styles.label}>Order Date</span>

              <div style={styles.inputWithIcon}>
                <CalendarDays size={16} color="#64748b" />

                <input
                  type="date"
                  value={formData.order_date}
                  onChange={(event) =>
                    updateField("order_date", event.target.value)
                  }
                  disabled={loading}
                  style={styles.dateInput}
                />
              </div>
            </label>

            <label style={styles.fieldGroup}>
              <span style={styles.label}>Expected Delivery</span>

              <div style={styles.inputWithIcon}>
                <CalendarDays size={16} color="#64748b" />

                <input
                  type="date"
                  value={formData.expected_delivery_date}
                  onChange={(event) =>
                    updateField("expected_delivery_date", event.target.value)
                  }
                  disabled={loading}
                  style={styles.dateInput}
                />
              </div>
            </label>
          </div>

          <label style={styles.fieldGroup}>
            <span style={styles.label}>Notes</span>

            <textarea
              value={formData.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              disabled={loading}
              placeholder="Add any supplier, delivery, or payment note..."
              rows={3}
              style={styles.textarea}
            />
          </label>

          <div style={styles.itemsSection}>
            <div style={styles.itemsHeader}>
              <div>
                <h3 style={styles.itemsTitle}>Order Items</h3>
                <p style={styles.itemsSubtitle}>
                  Update products, quantities, and unit costs.
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                disabled={loading}
                style={styles.addItemButton}
              >
                <Plus size={17} />
                Add Item
              </button>
            </div>

            <div style={styles.itemsList}>
              {formData.items.map((item, index) => {
                const itemTotal =
                  (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0);

                return (
                  <div key={item.id || index} style={styles.itemRow}>
                    <div style={styles.itemNumber}>{index + 1}</div>

                    <div style={styles.itemFields}>
                      <label style={styles.itemField}>
                        <span style={styles.smallLabel}>Product Variant</span>

                        <select
                          value={item.variant}
                          onChange={(event) =>
                            updateItem(index, "variant", event.target.value)
                          }
                          disabled={loading}
                          style={styles.input}
                        >
                          <option value="">Select product variant</option>

                          {variants.map((variant) => (
                            <option key={variant.id} value={variant.id}>
                              {variant.product_name ||
                                variant.product?.name ||
                                "Product"}
                              {" — "}
                              {variant.color || "No color"}
                              {" / "}
                              {variant.size || "No size"}
                              {" / "}
                              {variant.sku || `Variant #${variant.id}`}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label style={styles.itemFieldSmall}>
                        <span style={styles.smallLabel}>Qty</span>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(index, "quantity", event.target.value)
                          }
                          disabled={loading}
                          style={styles.input}
                        />
                      </label>

                      <label style={styles.itemFieldSmall}>
                        <span style={styles.smallLabel}>Unit Cost</span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_cost}
                          onChange={(event) =>
                            updateItem(index, "unit_cost", event.target.value)
                          }
                          disabled={loading}
                          style={styles.input}
                        />
                      </label>

                      <div style={styles.totalBox}>
                        <span style={styles.smallLabel}>Line Total</span>
                        <strong style={styles.lineTotal}>
                          {itemTotal.toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={loading}
                      style={styles.removeButton}
                      title="Remove item"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={styles.grandTotal}>
            <span>Total Purchase Amount</span>
            <strong>{totalAmount.toLocaleString()}</strong>
          </div>
        </div>

        <div style={styles.footer}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={styles.cancelButton}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            style={styles.saveButton}
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    padding: "18px",
    overflowY: "auto",
    background: "rgba(15, 23, 42, 0.58)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "100%",
    maxWidth: "1050px",
    maxHeight: "92vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "22px",
    boxShadow: "0 28px 60px rgba(15, 23, 42, 0.3)",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "22px 26px",
    borderBottom: "1px solid #e2e8f0",
  },

  headingGroup: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  iconBox: {
    width: "44px",
    height: "44px",
    borderRadius: "13px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "21px",
    fontWeight: 800,
  },

  subtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  closeButton: {
    width: "38px",
    height: "38px",
    border: "1px solid #e2e8f0",
    borderRadius: "11px",
    background: "#f8fafc",
    color: "#334155",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    padding: "24px 26px",
  },

  errorBox: {
    margin: "18px 26px 0",
    padding: "12px 14px",
    borderRadius: "12px",
    color: "#b91c1c",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    fontSize: "14px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    color: "#334155",
    fontSize: "14px",
    fontWeight: 700,
  },

  smallLabel: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 700,
  },

  input: {
    width: "100%",
    minHeight: "44px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "11px",
    padding: "0 12px",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "14px",
    outline: "none",
  },

  inputWithIcon: {
    minHeight: "44px",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "0 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "11px",
    background: "#ffffff",
  },

  dateInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#0f172a",
    fontSize: "14px",
    width: "100%",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    border: "1px solid #cbd5e1",
    borderRadius: "11px",
    padding: "11px 12px",
    background: "#ffffff",
    color: "#0f172a",
    fontFamily: "inherit",
    fontSize: "14px",
    outline: "none",
  },

  itemsSection: {
    marginTop: "26px",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    overflow: "hidden",
  },

  itemsHeader: {
    padding: "17px 18px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },

  itemsTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "16px",
    fontWeight: 800,
  },

  itemsSubtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  addItemButton: {
    border: "none",
    borderRadius: "10px",
    padding: "10px 13px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#ffffff",
    background: "#2563eb",
    fontWeight: 700,
    cursor: "pointer",
  },

  itemsList: {
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  itemRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "11px",
    padding: "13px",
    border: "1px solid #e2e8f0",
    borderRadius: "13px",
    background: "#ffffff",
  },

  itemNumber: {
    width: "28px",
    height: "28px",
    flexShrink: 0,
    borderRadius: "50%",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 800,
  },

  itemFields: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "minmax(190px, 1fr) 90px 120px 105px",
    gap: "10px",
  },

  itemField: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  itemFieldSmall: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  totalBox: {
    minHeight: "44px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "3px",
    padding: "0 10px",
    borderRadius: "11px",
    background: "#f8fafc",
  },

  lineTotal: {
    color: "#0f172a",
    fontSize: "14px",
  },

  removeButton: {
    width: "38px",
    height: "38px",
    flexShrink: 0,
    marginTop: "19px",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    background: "#fff1f2",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  grandTotal: {
    marginTop: "18px",
    padding: "15px 17px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: "13px",
    color: "#0f172a",
    background: "#eff6ff",
    fontSize: "15px",
    fontWeight: 700,
  },

  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "18px 26px",
    borderTop: "1px solid #e2e8f0",
  },

  cancelButton: {
    minWidth: "118px",
    height: "46px",
    border: "1px solid #cbd5e1",
    borderRadius: "11px",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 700,
    cursor: "pointer",
  },

  saveButton: {
    minWidth: "145px",
    height: "46px",
    border: "none",
    borderRadius: "11px",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
};
