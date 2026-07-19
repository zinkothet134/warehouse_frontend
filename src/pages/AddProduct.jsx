import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/api";
import ErrorModal from "../components/common/ErrorModal";

export default function AddProduct() {
  const navigate = useNavigate();

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [parsedErrors, setParsedErrors] = useState([]);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [attributes, setAttributes] = useState([]);

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
  });

  const [variants, setVariants] = useState([
    {
      sku: "",
      attribute_values: {}, // Stores selections like { attrId: valueId }
      cost_price: "",
      wholesale_price: "",
      retail_price: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        // Fetch everything, including the standalone attribute values
        const [cRes, bRes, attrRes, valRes] = await Promise.all([
          api.get("products/categories/"),
          api.get("products/brands/"),
          api.get("products/attributes/"),
          api.get("products/attribute-values/"),
        ]);

        setCategories(cRes.data.results || cRes.data);
        setBrands(bRes.data.results || bRes.data);

        // Combine attributes and values just like in the VariantManager
        const attrsData = attrRes.data.results || attrRes.data;
        const valsData = valRes.data.results || valRes.data;

        const combinedAttributes = attrsData.map((attr) => {
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

        setAttributes(combinedAttributes);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDropdowns();
  }, []);

  const generateSKU = (p, attrValuesObj) => {
    const brand =
      brands
        .find((x) => String(x.id) === String(p.brand))
        ?.name?.substring(0, 3)
        ?.toUpperCase() || "BRN";
    const category =
      categories
        .find((x) => String(x.id) === String(p.category))
        ?.name?.substring(0, 3)
        ?.toUpperCase() || "CAT";

    const product = p.name
      ? p.name
          .trim()
          .split(/\s+/)
          .map((word) => word.charAt(0))
          .join("")
          .toUpperCase()
      : "PRD";

    const attrStrings = attributes
      .map((attr) => {
        const selectedValueId = attrValuesObj[attr.id];
        if (!selectedValueId) return "";

        const valObj = attr.values.find(
          (v) => String(v.id) === String(selectedValueId),
        );
        return valObj ? valObj.value.substring(0, 3).toUpperCase() : "";
      })
      .filter(Boolean)
      .join("-");

    const baseSku = `${brand}-${category}-${product}`;
    return attrStrings ? `${baseSku}-${attrStrings}` : baseSku;
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    const updatedProduct = { ...productData, [name]: value };

    setProductData(updatedProduct);

    if (["name", "brand", "category"].includes(name)) {
      setVariants((prev) =>
        prev.map((v) => ({
          ...v,
          sku: generateSKU(updatedProduct, v.attribute_values),
        })),
      );
    }
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...variants];
    updated[index][name] = value;
    setVariants(updated);
  };

  const handleAttributeChange = (index, attrId, valueId) => {
    const updated = [...variants];
    updated[index].attribute_values = {
      ...updated[index].attribute_values,
      [attrId]: valueId,
    };

    updated[index].sku = generateSKU(
      productData,
      updated[index].attribute_values,
    );
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        sku: "",
        attribute_values: {},
        cost_price: "",
        wholesale_price: "",
        retail_price: "",
      },
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length === 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const cleanedProductData = {
        ...productData,
        category: productData.category
          ? parseInt(productData.category, 10)
          : null,
        brand: productData.brand ? parseInt(productData.brand, 10) : null,
      };

      const cleanedVariants = variants.map((v) => {
        const m2mAttributeValues = Object.values(v.attribute_values)
          .filter((val) => val !== "")
          .map((val) => parseInt(val, 10));

        return {
          sku: v.sku,
          attribute_values: m2mAttributeValues,
          cost_price: v.cost_price ? parseFloat(v.cost_price) : 0,
          wholesale_price: v.wholesale_price
            ? parseFloat(v.wholesale_price)
            : 0,
          retail_price: v.retail_price ? parseFloat(v.retail_price) : 0,
        };
      });

      const payload = {
        ...cleanedProductData,
        variants: cleanedVariants,
      };

      await api.post("/products/catalog/", payload);
      navigate("/products");
    } catch (err) {
      console.error("EXACT DJANGO ERROR:", err.response?.data);
      const drfError = err.response?.data;
      let formattedErrors = [];

      if (drfError) {
        Object.keys(drfError).forEach((key) => {
          if (key === "variants" && Array.isArray(drfError[key])) {
            drfError[key].forEach((variantErrorObj, index) => {
              if (variantErrorObj) {
                Object.keys(variantErrorObj).forEach((vKey) => {
                  formattedErrors.push(
                    `Variant ${index + 1} (${vKey}): ${variantErrorObj[vKey][0]}`,
                  );
                });
              }
            });
          } else if (Array.isArray(drfError[key])) {
            const cleanKey = key.charAt(0).toUpperCase() + key.slice(1);
            formattedErrors.push(`${cleanKey}: ${drfError[key][0]}`);
          } else if (typeof drfError[key] === "string") {
            formattedErrors.push(drfError[key]);
          }
        });
      }

      if (formattedErrors.length === 0) {
        formattedErrors.push(
          "An unexpected error occurred while saving the product.",
        );
      }

      setParsedErrors(formattedErrors);
      setErrorModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={pageStyle}>
      <form onSubmit={handleSubmit}>
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Add Product</h1>
            <p style={subtitleStyle}>
              Create a product and manage its variants.
            </p>
          </div>
          <button type="submit" disabled={isSubmitting} style={saveButtonStyle}>
            {isSubmitting ? "Saving..." : "Save Product"}
          </button>
        </div>

        <section style={cardStyle}>
          <h2 style={sectionTitle}>Basic Information</h2>
          <div style={{ marginBottom: "16px" }}>
            <InputGroup
              label="Product Name"
              name="name"
              placeholder="e.g., Air Max Alpha"
              value={productData.name}
              onChange={handleProductChange}
            />
          </div>

          <div style={responsiveGrid}>
            <SelectGroup
              label="Brand"
              name="brand"
              value={productData.brand}
              onChange={handleProductChange}
              options={brands}
            />
            <SelectGroup
              label="Category"
              name="category"
              value={productData.category}
              onChange={handleProductChange}
              options={categories}
            />
          </div>
          <InputGroup
            label="Description"
            name="description"
            placeholder="Product details..."
            value={productData.description}
            onChange={handleProductChange}
          />
        </section>

        <section style={cardStyle}>
          <div style={variantHeader}>
            <h2 style={sectionTitle}>Product Variants</h2>
            <button type="button" onClick={addVariant} style={addButton}>
              + Add Variant
            </button>
          </div>

          {variants.map((variant, index) => (
            <div key={index} style={variantCard}>
              {/* Dynamic Attribute Dropdowns */}
              {attributes.length > 0 && (
                <div style={attributeGrid}>
                  {attributes.map((attr) => (
                    <SelectGroup
                      key={attr.id}
                      label={attr.name}
                      value={variant.attribute_values[attr.id] || ""}
                      onChange={(e) =>
                        handleAttributeChange(index, attr.id, e.target.value)
                      }
                      options={attr.values.map((val) => ({
                        id: val.id,
                        name: val.value,
                      }))}
                    />
                  ))}
                </div>
              )}

              <hr style={dividerStyle} />

              <div style={responsiveGrid}>
                <InputGroup
                  label="SKU (Auto-Generated)"
                  name="sku"
                  value={variant.sku}
                  disabled
                />
                <InputGroup
                  label="Cost Price"
                  name="cost_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={variant.cost_price}
                  onChange={(e) => handleVariantChange(index, e)}
                />
                <InputGroup
                  label="Wholesale Price"
                  name="wholesale_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={variant.wholesale_price}
                  onChange={(e) => handleVariantChange(index, e)}
                />
                <InputGroup
                  label="Retail Price"
                  name="retail_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={variant.retail_price}
                  onChange={(e) => handleVariantChange(index, e)}
                />
              </div>

              {variants.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "16px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    style={deleteButton}
                  >
                    Remove Variant
                  </button>
                </div>
              )}
            </div>
          ))}
        </section>
      </form>
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errorMessages={parsedErrors}
      />
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
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "20px",
  marginBottom: "32px",
};
const titleStyle = {
  margin: 0,
  fontSize: "28px",
  fontWeight: 700,
  color: "#0f172a",
  letterSpacing: "-0.5px",
};
const subtitleStyle = { color: "#64748b", marginTop: "6px", fontSize: "15px" };
const cardStyle = {
  background: "#ffffff",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  border: "1px solid #e2e8f0",
};
const sectionTitle = {
  margin: "0 0 20px 0",
  fontSize: "18px",
  fontWeight: 600,
  color: "#1e293b",
};

const responsiveGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "16px",
};
const attributeGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "16px",
  marginBottom: "16px",
  background: "#f1f5f9",
  padding: "16px",
  borderRadius: "8px",
};

const variantHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  marginBottom: "20px",
};
const variantCard = {
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "20px",
  marginBottom: "20px",
  background: "#ffffff",
};
const dividerStyle = {
  border: "none",
  borderTop: "1px solid #e2e8f0",
  margin: "20px 0",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  boxSizing: "border-box",
  color: "#334155",
  outline: "none",
  background: "#ffffff",
};
const saveButtonStyle = {
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  padding: "10px 24px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  transition: "background 0.2s",
};
const addButton = {
  background: "#10b981",
  color: "#ffffff",
  border: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
};
const deleteButton = {
  background: "#ffffff",
  color: "#ef4444",
  border: "1px solid #ef4444",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 500,
};

function InputGroup({ label, ...props }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "14px",
          fontWeight: 500,
          color: "#475569",
        }}
      >
        {label}
      </label>
      <input
        {...props}
        style={{
          ...inputStyle,
          ...(props.disabled
            ? { background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }
            : {}),
        }}
      />
    </div>
  );
}

function SelectGroup({ label, options, ...props }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "14px",
          fontWeight: 500,
          color: "#475569",
        }}
      >
        {label}
      </label>
      <select {...props} style={inputStyle}>
        <option value="">Select...</option>
        {!Array.isArray(options) || options.length === 0 ? (
          <option value="" disabled>
            No options available
          </option>
        ) : (
          options.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))
        )}
      </select>
    </div>
  );
}
