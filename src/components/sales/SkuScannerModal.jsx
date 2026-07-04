import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Minus, Plus, Search, X } from "lucide-react";
import api from "../../libs/api";

export default function SkuScannerModal({
  isOpen,
  initialSaleMode = "RETAIL",
  onClose,
  onAddToCart,
}) {
  const videoRef = useRef(null);
  const scannerControlsRef = useRef(null);
  const isLookingUpRef = useRef(false);

  const [scannedVariant, setScannedVariant] = useState(null);
  const [saleMode, setSaleMode] = useState(initialSaleMode);
  const [quantity, setQuantity] = useState(1);
  const [manualSku, setManualSku] = useState("");
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const stopScanner = useCallback(() => {
    if (scannerControlsRef.current) {
      scannerControlsRef.current.stop();
      scannerControlsRef.current = null;
    }
  }, []);

  const resetScanner = useCallback(() => {
    stopScanner();
    isLookingUpRef.current = false;
    setScannedVariant(null);
    setQuantity(1);
    setManualSku("");
    setError("");
  }, [stopScanner]);

  const findVariantBySku = useCallback(
    async (sku) => {
      const cleanSku = sku.trim();

      if (!cleanSku || isLookingUpRef.current) return;

      isLookingUpRef.current = true;
      setError("");
      setIsSearching(true);
      stopScanner();

      try {
        const response = await api.get(
          `products/variants/?search=${encodeURIComponent(cleanSku)}`,
        );

        const results = response.data.results || response.data || [];

        const exactVariant = results.find(
          (item) =>
            item.sku?.trim().toLowerCase() === cleanSku.trim().toLowerCase(),
        );

        const variant = exactVariant || results[0];

        if (!variant) {
          setError(`No product found for SKU: ${cleanSku}`);
          return;
        }

        if ((variant.stock || 0) <= 0) {
          setError(`${variant.product_name} is out of stock.`);
          return;
        }

        setScannedVariant(variant);
        setQuantity(1);
      } catch (err) {
        console.error("Scanner SKU lookup failed:", err);
        setError("Unable to find this SKU. Please try again.");
      } finally {
        setIsSearching(false);
        isLookingUpRef.current = false;
      }
    },
    [stopScanner],
  );

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    setSaleMode(initialSaleMode);
    setScannedVariant(null);
    setQuantity(1);
    setManualSku("");
    setError("");

    return () => stopScanner();
  }, [isOpen, initialSaleMode, stopScanner]);

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      if (!isOpen || scannedVariant || !videoRef.current) return;

      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");

        if (!isMounted || !videoRef.current) return;

        const codeReader = new BrowserMultiFormatReader();

        const controls = await codeReader.decodeFromConstraints(
          {
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          videoRef.current,
          (result) => {
            if (result && !isLookingUpRef.current) {
              findVariantBySku(result.getText());
            }
          },
        );

        if (isMounted) {
          scannerControlsRef.current = controls;
        } else {
          controls.stop();
        }
      } catch (err) {
        console.error("Camera access error:", err);

        if (isMounted) {
          setError(
            "Camera is unavailable. Allow camera permission or enter the SKU manually.",
          );
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isOpen, scannedVariant, findVariantBySku, stopScanner]);

  const maxStock = scannedVariant?.stock || 1;

  const selectedPrice = Number(
    saleMode === "WHOLESALE"
      ? scannedVariant?.wholesale_price
      : scannedVariant?.retail_price,
  );

  const handleQuantityChange = (value) => {
    const nextQuantity = Number(value);

    if (!Number.isFinite(nextQuantity)) {
      setQuantity(1);
      return;
    }

    setQuantity(Math.min(Math.max(1, nextQuantity), maxStock));
  };

  const handleAddToCart = () => {
    if (!scannedVariant) return;

    onAddToCart({
      variant: scannedVariant,
      quantity,
      saleMode,
    });
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <div style={styles.titleRow}>
              <div style={styles.cameraIcon}>
                <Camera size={20} />
              </div>
              <h2 style={styles.title}>Scan product</h2>
            </div>

            <p style={styles.subtitle}>
              Scan a barcode or enter the SKU manually.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            style={styles.closeButton}
            aria-label="Close scanner"
          >
            <X size={20} />
          </button>
        </div>

        {!scannedVariant ? (
          <>
            <div style={styles.cameraContainer}>
              <video
                ref={videoRef}
                style={styles.cameraVideo}
                muted
                playsInline
              />
              <div style={styles.scanFrame} />
              <p style={styles.cameraHint}>
                Align the barcode inside the frame
              </p>
            </div>

            <div style={styles.orDivider}>
              <span style={styles.dividerLine} />
              <span>OR</span>
              <span style={styles.dividerLine} />
            </div>

            <div style={styles.manualSearchRow}>
              <div style={styles.manualInputWrapper}>
                <Search size={18} color="#64748b" />
                <input
                  value={manualSku}
                  onChange={(event) => setManualSku(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      findVariantBySku(manualSku);
                    }
                  }}
                  placeholder="Enter SKU manually"
                  style={styles.manualInput}
                />
              </div>

              <button
                type="button"
                onClick={() => findVariantBySku(manualSku)}
                disabled={!manualSku.trim() || isSearching}
                style={{
                  ...styles.findButton,
                  opacity: !manualSku.trim() || isSearching ? 0.65 : 1,
                }}
              >
                {isSearching ? "Finding..." : "Find"}
              </button>
            </div>
          </>
        ) : (
          <div style={styles.productReview}>
            <div style={styles.successRow}>
              <CheckCircle2 size={21} />
              Product found
            </div>

            <div style={styles.productCard}>
              <div>
                <div style={styles.productName}>
                  {scannedVariant.product_name}
                </div>
                <div style={styles.sku}>SKU: {scannedVariant.sku}</div>
              </div>

              <div style={styles.stockBadge}>
                {scannedVariant.stock || 0} in stock
              </div>
            </div>

            <div style={styles.productInfo}>
              <span>{scannedVariant.color}</span>
              <span>Size {scannedVariant.size}</span>
            </div>

            <div style={styles.sectionLabel}>Sale type</div>

            <div style={styles.modeGrid}>
              <button
                type="button"
                onClick={() => setSaleMode("RETAIL")}
                style={{
                  ...styles.modeButton,
                  ...(saleMode === "RETAIL" ? styles.modeButtonActive : {}),
                }}
              >
                <span>Retail</span>
                <strong>
                  ${Number(scannedVariant.retail_price).toFixed(2)}
                </strong>
              </button>

              <button
                type="button"
                onClick={() => setSaleMode("WHOLESALE")}
                style={{
                  ...styles.modeButton,
                  ...(saleMode === "WHOLESALE" ? styles.modeButtonActive : {}),
                }}
              >
                <span>Wholesale</span>
                <strong>
                  ${Number(scannedVariant.wholesale_price).toFixed(2)}
                </strong>
              </button>
            </div>

            <div style={styles.quantitySection}>
              <div>
                <div style={styles.sectionLabel}>Quantity</div>
                <div style={styles.quantityHint}>Maximum: {maxStock}</div>
              </div>

              <div style={styles.quantityControl}>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                  style={styles.quantityButton}
                >
                  <Minus size={17} />
                </button>

                <input
                  type="number"
                  min="1"
                  max={maxStock}
                  value={quantity}
                  onChange={(event) => handleQuantityChange(event.target.value)}
                  style={styles.quantityInput}
                />

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => Math.min(maxStock, current + 1))
                  }
                  style={styles.quantityButton}
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>

            <div style={styles.totalBox}>
              <span>Item total</span>
              <strong>${(quantity * selectedPrice).toFixed(2)}</strong>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              style={styles.addButton}
            >
              Add to cart
            </button>

            <button
              type="button"
              onClick={resetScanner}
              style={styles.scanAnotherButton}
            >
              Scan another product
            </button>
          </div>
        )}

        {error && <div style={styles.errorBox}>{error}</div>}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    background: "rgba(15, 23, 42, 0.72)",
    backdropFilter: "blur(4px)",
  },
  modal: {
    width: "min(100%, 540px)",
    maxHeight: "92vh",
    overflowY: "auto",
    borderRadius: "24px",
    background: "#ffffff",
    padding: "22px",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.34)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "18px",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  cameraIcon: {
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    background: "#dbeafe",
    color: "#2563eb",
  },
  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "22px",
    fontWeight: "800",
  },
  subtitle: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },
  closeButton: {
    width: "38px",
    height: "38px",
    border: "none",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    color: "#475569",
    cursor: "pointer",
  },
  cameraContainer: {
    position: "relative",
    overflow: "hidden",
    minHeight: "280px",
    borderRadius: "18px",
    background: "#0f172a",
  },
  cameraVideo: {
    display: "block",
    width: "100%",
    height: "280px",
    objectFit: "cover",
  },
  scanFrame: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "76%",
    height: "108px",
    border: "2px solid #60a5fa",
    borderRadius: "14px",
    transform: "translate(-50%, -50%)",
    boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.2)",
    pointerEvents: "none",
  },
  cameraHint: {
    position: "absolute",
    bottom: "14px",
    left: 0,
    right: 0,
    margin: 0,
    color: "#ffffff",
    textAlign: "center",
    fontSize: "13px",
    fontWeight: "600",
  },
  orDivider: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "18px 0",
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.08em",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e2e8f0",
  },
  manualSearchRow: {
    display: "flex",
    gap: "10px",
  },
  manualInputWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "9px",
    minWidth: 0,
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "0 13px",
  },
  manualInput: {
    width: "100%",
    border: "none",
    outline: "none",
    padding: "14px 0",
    fontSize: "14px",
    color: "#0f172a",
  },
  findButton: {
    border: "none",
    borderRadius: "12px",
    padding: "0 20px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "800",
    cursor: "pointer",
  },
  productReview: {
    borderRadius: "18px",
    padding: "18px",
    background: "#f8fbff",
    border: "1px solid #dbeafe",
  },
  successRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#15803d",
    fontWeight: "800",
    fontSize: "14px",
    marginBottom: "16px",
  },
  productCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },
  productName: {
    color: "#0f172a",
    fontSize: "19px",
    fontWeight: "800",
  },
  sku: {
    marginTop: "5px",
    color: "#2563eb",
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: "13px",
  },
  stockBadge: {
    flexShrink: 0,
    padding: "6px 9px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "12px",
    fontWeight: "800",
  },
  productInfo: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
    color: "#475569",
    fontSize: "13px",
  },
  sectionLabel: {
    marginTop: "20px",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "800",
  },
  modeGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "9px",
  },
  modeButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "4px",
    border: "1px solid #cbd5e1",
    borderRadius: "13px",
    padding: "13px",
    background: "#ffffff",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "12px",
  },
  modeButtonActive: {
    border: "2px solid #2563eb",
    background: "#eff6ff",
    color: "#1d4ed8",
  },
  quantitySection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "20px",
  },
  quantityHint: {
    marginTop: "4px",
    color: "#94a3b8",
    fontSize: "12px",
  },
  quantityControl: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  quantityButton: {
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: "10px",
    background: "#e2e8f0",
    color: "#334155",
    cursor: "pointer",
  },
  quantityInput: {
    width: "58px",
    height: "38px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    color: "#0f172a",
    fontWeight: "800",
    textAlign: "center",
  },
  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    padding: "14px",
    borderRadius: "12px",
    background: "#eaf2ff",
    color: "#1e3a8a",
    fontSize: "14px",
  },
  addButton: {
    width: "100%",
    marginTop: "14px",
    border: "none",
    borderRadius: "13px",
    padding: "15px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(37, 99, 235, 0.24)",
  },
  scanAnotherButton: {
    width: "100%",
    marginTop: "10px",
    border: "none",
    background: "transparent",
    color: "#2563eb",
    padding: "10px",
    fontWeight: "800",
    cursor: "pointer",
  },
  errorBox: {
    marginTop: "16px",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "12px",
    background: "#fef2f2",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: "600",
  },
};
