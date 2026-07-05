// src/pages/AddProduct.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../libs/api";
import ErrorModal from "../components/common/ErrorModal";

const variantColumns = [
  { name: "sku", label: "SKU" },
  { name: "color", label: "Color" },
  { name: "size", label: "Size" },
  { name: "cost_price", label: "Cost Price" },
  { name: "wholesale_price", label: "Wholesale Price" },
  { name: "retail_price", label: "Retail Price" },
];

export default function AddProduct() {
  const navigate = useNavigate();
  // Error Modal State
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [parsedErrors, setParsedErrors] = useState([]);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
  });

  const [variants, setVariants] = useState([
    {
      sku: "",
      color: "",
      size: "",
      cost_price: "",
      wholesale_price: "",
      retail_price: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [cRes, bRes] = await Promise.all([
          api.get("products/categories/"),
          api.get("products/brands/"),
        ]);

        setCategories(cRes.data.results || cRes.data);
        setBrands(bRes.data.results || bRes.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDropdowns();
  }, []);

  const generateSKU = (p, color, size) => {
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

    // const product = p.name?.substring(0, 3)?.toUpperCase() || "PRD";
    const product = p.name
      ? p.name
          .trim()
          .split(/\s+/) // Splits the name by spaces
          .map((word) => word.charAt(0)) // Grabs the first letter of each word
          .join("") // Joins those letters together
          .toUpperCase()
      : "PRD";

    const clr = color?.substring(0, 3)?.toUpperCase() || "CLR";

    return `${brand}-${category}-${product}-${clr}-${size || "SZ"}`;
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;

    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (["name", "brand", "category"].includes(name)) {
      setVariants((prev) =>
        prev.map((v) => ({
          ...v,
          sku: generateSKU({ ...productData, [name]: value }, v.color, v.size),
        })),
      );
    }
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;

    const updated = [...variants];

    updated[index][name] = value;

    if (name === "color" || name === "size") {
      updated[index].sku = generateSKU(
        productData,
        updated[index].color,
        updated[index].size,
      );
    }

    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        sku: "",
        color: "",
        size: "",
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

      // 1. Scrub the product data
      const cleanedProductData = {
        ...productData,
        // Convert to integers, or if empty, send null
        category: productData.category
          ? parseInt(productData.category, 10)
          : null,
        brand: productData.brand ? parseInt(productData.brand, 10) : null,
      };

      // 2. Scrub the variants
      const cleanedVariants = variants.map((v) => ({
        ...v,

        cost_price: v.cost_price ? parseFloat(v.cost_price) : 0,

        wholesale_price: v.wholesale_price ? parseFloat(v.wholesale_price) : 0,

        retail_price: v.retail_price ? parseFloat(v.retail_price) : 0,
      }));

      // 3. Assemble the final payload
      const payload = {
        ...cleanedProductData,
        variants: cleanedVariants,
      };

      console.log("Cleaned Payload Sending to backend:", payload);

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

      // 🌟 Trigger the custom modal
      setParsedErrors(formattedErrors);
      setErrorModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={pageStyle}>
      <form onSubmit={handleSubmit}>
        {/* HEADER */}

        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Add Product</h1>

            <p style={subtitleStyle}>
              Create a product and manage its variants
            </p>
          </div>

          <button type="submit" disabled={isSubmitting} style={saveButtonStyle}>
            {isSubmitting ? "Saving..." : "Save Product"}
          </button>
        </div>

        {/* BASIC INFO */}

        <section style={cardStyle}>
          <h2 style={sectionTitle}>Basic Information</h2>

          <InputGroup
            label="Product Name"
            name="name"
            value={productData.name}
            onChange={handleProductChange}
          />

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
            value={productData.description}
            onChange={handleProductChange}
          />
        </section>

        {/* VARIANTS */}

        <section style={cardStyle}>
          <div style={variantHeader}>
            <h2 style={sectionTitle}>Product Variants</h2>

            <button type="button" onClick={addVariant} style={addButton}>
              + Add Variant
            </button>
          </div>

          {variants.map((variant, index) => (
            <div key={index} style={variantCard}>
              <div style={responsiveGrid}>
                <InputGroup
                  label="SKU"
                  name="sku"
                  value={variant.sku}
                  disabled
                />

                <InputGroup
                  label="Color"
                  name="color"
                  value={variant.color}
                  onChange={(e) => handleVariantChange(index, e)}
                />

                <InputGroup
                  label="Size"
                  name="size"
                  value={variant.size}
                  onChange={(e) => handleVariantChange(index, e)}
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

              <div style={{ marginTop: "15px" }}>
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  style={deleteButton}
                >
                  Remove Variant
                </button>
              </div>
            </div>
          ))}
        </section>
      </form>
      {/* DRF VALIDATION ERROR MODAL */}
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
  padding: "24px",
  background: "#f8fafc",
  minHeight: "100vh",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "20px",
  marginBottom: "24px",
};

const titleStyle = {
  margin: 0,
  fontSize: "32px",
  fontWeight: 700,
};

const subtitleStyle = {
  color: "#64748b",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "16px",
  padding: "24px",
  marginBottom: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const sectionTitle = {
  marginBottom: "20px",
  fontSize: "18px",
  fontWeight: 600,
};

const responsiveGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
  gap: "16px",
  marginBottom: "16px",
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
  borderRadius: "12px",
  padding: "16px",
  marginBottom: "16px",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  boxSizing: "border-box",
};

const saveButtonStyle = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "12px 24px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 600,
};

const addButton = {
  background: "#22c55e",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 600,
};

const deleteButton = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};

function InputGroup({ label, ...props }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: 500,
        }}
      >
        {label}
      </label>

      <input
        {...props}
        style={{
          ...inputStyle,
          ...(props.disabled
            ? {
                background: "#f1f5f9",
                color: "#64748b",
              }
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
          marginBottom: "8px",
          fontWeight: 500,
        }}
      >
        {label}
      </label>

      <select {...props} style={inputStyle}>
        <option value="">Select...</option>

        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}
