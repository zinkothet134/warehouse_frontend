// src/pages/BrandsCategories.jsx
import React, { useState, useEffect } from "react";
import api from "../libs/api";
import AttributeCard from "../components/common/AttributeCard";

export default function BrandsCategories() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        api.get("products/brands/"),
        api.get("products/categories/"),
      ]);
      setBrands(bRes.data.results || bRes.data);
      setCategories(cRes.data.results || cRes.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleAdd = async (endpoint, value, setter, list) => {
    if (!value.trim()) return;
    try {
      // Auto-slugging for convenience
      const slug = value.toLowerCase().replace(/ /g, "-");
      await api.post(endpoint, { name: value, slug: slug });
      setter("");
      fetchData();
    } catch (err) {
      alert(`Error adding ${value}`);
    }
  };
  const handleEdit = async (endpoint, id, newName) => {
    if (!newName.trim()) return;
    try {
      const slug = newName.toLowerCase().replace(/ /g, "-");
      await api.patch(`${endpoint}${id}/`, { name: newName, slug: slug });
      fetchData();
    } catch (err) {
      alert("Error updating item. It might already exist.");
      throw err;
    }
  };

  const handleDelete = async (endpoint, id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`${endpoint}${id}/`);
      fetchData();
    } catch (err) {
      alert("Error deleting item. It might be attached to existing products.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "0 20px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", color: "#1a1a1a", marginBottom: "8px" }}>
          Product Attributes
        </h1>
        <p style={{ color: "#666" }}>
          Manage your catalog structure, brands, and categories here.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "30px",
        }}
      >
        {/* Attribute Card Component */}
        <AttributeCard
          title="Brands"
          icon="🏷️"
          items={brands}
          inputValue={newBrand}
          setInputValue={setNewBrand}
          onAdd={() => handleAdd("products/brands/", newBrand, setNewBrand)}
          onEdit={(id, newName) => handleEdit("products/brands/", id, newName)}
          onDelete={(id) => handleDelete("products/brands/", id)}
        />

        <AttributeCard
          title="Categories"
          icon="📁"
          items={categories}
          inputValue={newCategory}
          setInputValue={setNewCategory}
          onAdd={() =>
            handleAdd("products/categories/", newCategory, setNewCategory)
          }
          onEdit={(id, newName) =>
            handleEdit("products/categories/", id, newName)
          }
          onDelete={(id) => handleDelete("products/categories/", id)}
        />
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "1000px",
    margin: "40px auto",
    padding: "0 20px",
    fontFamily: "'Inter', sans-serif",
  },
  header: { marginBottom: "40px" },
  title: {
    fontSize: "28px",
    color: "#0f172a",
    marginBottom: "8px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },
  subtitle: { color: "#64748b", fontSize: "15px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "30px",
  },
};
