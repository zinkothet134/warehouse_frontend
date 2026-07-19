import React, { useState, useEffect } from "react";
import api from "../libs/api";

export default function VariantManager() {
  const [attributes, setAttributes] = useState([]);
  const [newAttributeName, setNewAttributeName] = useState("");
  const [newValueInputs, setNewValueInputs] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchAttributes = async () => {
    try {
      const [attrRes, valRes] = await Promise.all([
        api.get("products/attributes/"),
        api.get("products/attribute-values/"),
      ]);

      const attrsData = attrRes.data.results || attrRes.data;
      const valsData = valRes.data.results || valRes.data;

      const combined = attrsData.map((attr) => {
        if (
          attr.values &&
          attr.values.length > 0 &&
          typeof attr.values[0] === "object"
        ) {
          return attr;
        }

        const matchingValues = valsData.filter(
          (v) =>
            String(v.attribute) === String(attr.id) ||
            String(v.attribute_id) === String(attr.id),
        );

        return { ...attr, values: matchingValues };
      });

      setAttributes(combined);
    } catch (error) {
      console.error("Failed to fetch attributes:", error);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleCreateAttribute = async (e) => {
    e.preventDefault();
    if (!newAttributeName.trim()) return;

    try {
      setIsLoading(true);
      await api.post("products/attributes/", { name: newAttributeName });
      setNewAttributeName("");
      await fetchAttributes();
    } catch (error) {
      console.error("Failed to create attribute:", error.response?.data);
      alert("Error creating attribute. Check console.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateValue = async (attributeId) => {
    const valueText = newValueInputs[attributeId];
    if (!valueText || !valueText.trim()) return;

    try {
      await api.post("products/attribute-values/", {
        attribute: attributeId,
        value: valueText,
      });

      setNewValueInputs((prev) => ({ ...prev, [attributeId]: "" }));
      await fetchAttributes();
    } catch (error) {
      console.error("Failed to add value:", error.response?.data);
      alert("Error adding value. Check console.");
    }
  };

  const handleValueInputChange = (attributeId, text) => {
    setNewValueInputs((prev) => ({
      ...prev,
      [attributeId]: text,
    }));
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Variant Attributes</h1>
          <p style={subtitleStyle}>
            Manage product dimensions like Size, Color, and Material.
          </p>
        </div>
      </div>

      <div style={gridContainer}>
        {/* LEFT COLUMN: Create New Attribute */}
        <section style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={sectionTitle}>Create New Attribute</h2>
            <p style={helperTextStyle}>
              Define a new category for your product variants.
            </p>
          </div>

          <form
            onSubmit={handleCreateAttribute}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <input
              style={inputStyle}
              placeholder="e.g., Shoe Size, Color, Width..."
              value={newAttributeName}
              onChange={(e) => setNewAttributeName(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              style={primaryBtnStyle}
              disabled={isLoading || !newAttributeName.trim()}
            >
              {isLoading ? "Creating..." : "Create Attribute"}
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN: Manage Existing Attributes & Values */}
        <section
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {attributes.length === 0 ? (
            <div style={emptyStateCard}>
              <h3 style={{ margin: "0 0 8px 0", color: "#334155" }}>
                No Attributes Yet
              </h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                Use the panel on the left to create your first product
                attribute.
              </p>
            </div>
          ) : (
            attributes.map((attr) => (
              <div key={attr.id} style={attributeCardStyle}>
                <div style={attrHeaderStyle}>
                  <h3 style={attributeName}>{attr.name}</h3>
                  <span style={countBadge}>
                    {attr.values ? attr.values.length : 0} values
                  </span>
                </div>

                {/* User-Friendly Chip Layout for Values */}
                <div style={chipContainer}>
                  {attr.values && attr.values.length > 0 ? (
                    attr.values.map((val) => (
                      <div key={val.id} style={chipStyle}>
                        {val.value}
                      </div>
                    ))
                  ) : (
                    <p style={emptyTextStyle}>No values added yet.</p>
                  )}
                </div>

                {/* Inline Form to Add New Value - Designed as a cohesive input group */}
                <div style={inputGroupStyle}>
                  <input
                    style={inlineInputStyle}
                    placeholder={`Add new value (e.g., EU 42, Black)...`}
                    value={newValueInputs[attr.id] || ""}
                    onChange={(e) =>
                      handleValueInputChange(attr.id, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateValue(attr.id);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleCreateValue(attr.id)}
                    style={addBtnStyle}
                    disabled={!newValueInputs[attr.id]?.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */
const pageStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "32px 24px",
  background: "#f8fafc",
  minHeight: "100vh",
  fontFamily: "system-ui, -apple-system, sans-serif",
};
const headerStyle = { marginBottom: "32px" };
const titleStyle = {
  margin: 0,
  fontSize: "28px",
  fontWeight: 700,
  color: "#0f172a",
  letterSpacing: "-0.5px",
};
const subtitleStyle = { color: "#64748b", marginTop: "6px", fontSize: "15px" };

const gridContainer = {
  display: "grid",
  gridTemplateColumns: "350px 1fr",
  gap: "32px",
  alignItems: "start",
};

// Adjust to single column on smaller screens if you add media queries later, but standard flex/grid handles it well.
const cardStyle = {
  background: "#ffffff",
  borderRadius: "12px",
  padding: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  border: "1px solid #e2e8f0",
};
const cardHeaderStyle = { marginBottom: "20px" };
const sectionTitle = {
  margin: "0 0 4px 0",
  fontSize: "18px",
  fontWeight: 600,
  color: "#1e293b",
};
const helperTextStyle = { margin: 0, fontSize: "13px", color: "#64748b" };

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  color: "#334155",
  background: "#f8fafc",
  outline: "none",
  transition: "border-color 0.2s",
};
const primaryBtnStyle = {
  width: "100%",
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  padding: "12px 24px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
  transition: "background 0.2s",
};

const emptyStateCard = {
  background: "#ffffff",
  borderRadius: "12px",
  padding: "40px 24px",
  textAlign: "center",
  border: "1px dashed #cbd5e1",
};

const attributeCardStyle = {
  background: "#ffffff",
  borderRadius: "12px",
  padding: "20px 24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  border: "1px solid #e2e8f0",
};
const attrHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
};
const attributeName = {
  margin: 0,
  fontSize: "16px",
  fontWeight: 600,
  color: "#0f172a",
};
const countBadge = {
  background: "#f1f5f9",
  color: "#475569",
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: 500,
};

const chipContainer = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginBottom: "20px",
};
const chipStyle = {
  background: "#f1f5f9",
  color: "#334155",
  padding: "6px 14px",
  borderRadius: "20px",
  fontSize: "13.5px",
  fontWeight: 500,
  border: "1px solid #e2e8f0",
};
const emptyTextStyle = {
  fontSize: "14px",
  color: "#94a3b8",
  margin: 0,
  fontStyle: "italic",
};

// Makes the input and button look like a single connected element
const inputGroupStyle = {
  display: "flex",
  alignItems: "stretch",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  overflow: "hidden",
  background: "#ffffff",
};
const inlineInputStyle = {
  flex: 1,
  padding: "10px 14px",
  border: "none",
  fontSize: "14px",
  color: "#334155",
  outline: "none",
  background: "transparent",
};
const addBtnStyle = {
  background: "#f8fafc",
  color: "#3b82f6",
  border: "none",
  borderLeft: "1px solid #cbd5e1",
  padding: "0 20px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600,
  transition: "background 0.2s",
};
