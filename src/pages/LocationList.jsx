import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/api";

export default function LocationList() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get("inventory/locations/");
        // Extract from paginated results or fallback to flat array
        setLocations(response.data.results || response.data);
      } catch (err) {
        console.error("Failed to fetch locations:", err);
        setError("Failed to load warehouse locations.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (loading) {
    return <div style={styles.center}>Loading locations...</div>;
  }

  return (
    <div style={styles.page}>
      {/* HEADER SECTION WITH ADD BUTTON */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Warehouse Locations</h1>
          <p style={styles.subtitle}>
            Manage inventory storage zones and facilities
          </p>
        </div>

        {/* ADD LOCATION BUTTON */}
        <button
          onClick={() => navigate("/inventory/locations/add")}
          style={styles.addBtn}
        >
          + Add Location
        </button>
      </div>

      {error && <div style={styles.errorCard}>⚠️ {error}</div>}

      {/* DATA TABLE */}
      <div style={styles.tableCard}>
        {locations.length === 0 && !error ? (
          <div style={styles.emptyState}>
            No locations found. Click "Add Location" to create one.
          </div>
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Zone</th>
                  <th style={styles.th}>Address</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{loc.name}</strong>
                    </td>
                    <td style={styles.td}>{loc.zone || "—"}</td>
                    <td style={styles.td}>
                      <span style={styles.addressText}>
                        {loc.address || "No address provided"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={
                          loc.is_active
                            ? styles.statusActive
                            : styles.statusInactive
                        }
                      >
                        {loc.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.editBtn}
                        onClick={() =>
                          navigate(`/inventory/locations/edit/${loc.id}`)
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 24px",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  center: {
    textAlign: "center",
    padding: "60px",
    color: "#64748b",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "32px",
  },
  pageTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#64748b",
    marginTop: "6px",
    fontSize: "15px",
  },
  addBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    display: "inline-flex",
    alignItems: "center",
  },
  errorCard: {
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "14px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontWeight: "500",
    border: "1px solid #f87171",
  },
  tableCard: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,.05)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  emptyState: {
    padding: "40px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "15px",
  },
  tableResponsive: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "16px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    color: "#475569",
    fontWeight: "600",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tr: {
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "16px",
    color: "#334155",
    fontSize: "14px",
    verticalAlign: "middle",
  },
  addressText: {
    color: "#64748b",
    fontSize: "13px",
  },
  statusActive: {
    background: "#dcfce7",
    color: "#166534",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
  },
  statusInactive: {
    background: "#f1f5f9",
    color: "#475569",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
  },
  editBtn: {
    background: "transparent",
    border: "1px solid #cbd5e1",
    color: "#475569",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
};
