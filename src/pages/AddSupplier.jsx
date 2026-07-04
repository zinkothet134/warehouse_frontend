import { useState } from "react";
import SupplierForm from "../components/purchasing/SupplierForm";
import api from "../libs/api";

export default function AddSupplier() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const handleCreate = async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess("");

    try {
      await api.post("/purchasing/suppliers/", formData);

      setSuccess("Supplier added successfully.");
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;

        const errorMsg =
          data.email?.[0] ||
          data.name?.[0] ||
          data.detail ||
          "Failed to add supplier.";

        setError(errorMsg);
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Add New Supplier</h2>
        </div>

        {/* Reusable Form Component */}
        <SupplierForm
          onSubmit={handleCreate}
          isLoading={loading}
          error={error}
          success={success}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
    display: "flex",
    justifyContent: "center",
  },

  card: {
    width: "100%",
    maxWidth: "800px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },

  header: {
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
  },

  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
  },
};
