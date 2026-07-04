// src/components/Register.jsx
import { useState } from "react";
import api from "../../libs/api";
import { Link } from "react-router-dom"; // 👈 1. Import Link

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "SALES", // Default role
    phone_number: "",
  });
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);

    try {
      await api.post("accounts/register/", formData);
      setMessage("User successfully registered!");
      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "SALES",
        phone_number: "",
      });
    } catch (err) {
      // Django DRF sends back validation errors as an object (e.g., { email: ["This field is required."] })
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      }
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        fontFamily: "sans-serif",
      }}
    >
      <h2>Register Staff</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />
        {errors.username && (
          <span style={{ color: "red", fontSize: "12px" }}>
            {errors.username[0]}
          </span>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && (
          <span style={{ color: "red", fontSize: "12px" }}>
            {errors.email[0]}
          </span>
        )}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && (
          <span style={{ color: "red", fontSize: "12px" }}>
            {errors.password[0]}
          </span>
        )}

        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="ADMIN">Admin</option>
          <option value="WAREHOUSE">Warehouse Staff</option>
          <option value="CASHIER">Cashier</option>
          <option value="SALES">Sales Staff</option>
        </select>

        <input
          type="text"
          name="phone_number"
          placeholder="Phone Number"
          value={formData.phone_number}
          onChange={handleChange}
        />

        <button type="submit" style={{ padding: "10px", cursor: "pointer" }}>
          Register User
        </button>
      </form>
      {/* 👈 2. Add this link right below your form */}
      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}
