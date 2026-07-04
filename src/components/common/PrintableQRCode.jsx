import React from "react";
import { QRCodeCanvas } from "qrcode.react"; // Uses HTML canvas for perfect printing

export default function PrintableQRCode({ value, productName, size = 128 }) {
  if (!value) return null;

  return (
    <div style={styles.container}>
      {/* Product Name above the QR code */}
      <div style={styles.productName}>{productName}</div>

      {/* The dynamically generated QR Code */}
      <QRCodeCanvas
        value={value}
        size={size}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"H"} // High error correction (easier to scan if damaged)
      />

      {/* The actual string value below it for human reading */}
      <div style={styles.valueText}>{value}</div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    background: "#fff",
    border: "1px dashed #cbd5e1", // Good for showing where to cut the label
    borderRadius: "8px",
    width: "fit-content",
  },
  productName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "8px",
    textAlign: "center",
  },
  valueText: {
    marginTop: "8px",
    fontSize: "13px",
    fontFamily: "monospace",
    color: "#475569",
    fontWeight: "600",
  },
};
