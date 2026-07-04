// src/components/Login.jsx
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../../libs/api";
import { Link, useNavigate } from "react-router-dom"; // 👈 1. Import Link

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  // 1. Add a state to track failed attempts
  const [failedAttempts, setFailedAttempts] = useState(0);
  const navigate = useNavigate(); // 👈 2. Initialize the hook

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Send the POST request to Django
      const response = await api.post("accounts/login/", credentials);

      // Save tokens to Local Storage
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      // Decode the token to get the custom role we built earlier!
      const decodedToken = jwtDecode(response.data.access);
      console.log(
        "Logged in as:",
        decodedToken.username,
        "Role:",
        decodedToken.role,
      );

      // Reset failed attempts on success
      setFailedAttempts(0);
      // 👈 3. Redirect the user to the dashboard!
      // navigate("/dashboard");
      // alert(`Welcome back! You are logged in as a ${decodedToken.role}`);
      // Here, you would typically redirect the user to their dashboard using react-router
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Invalid username or password.");
      // 2. Increment the failed attempts counter every time it errors
      setFailedAttempts((prev) => prev + 1);
      console.error(err);
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
      <h2>System Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={credentials.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          required
        />
        <button type="submit" style={{ padding: "10px", cursor: "pointer" }}>
          Login
        </button>
      </form>
      {/* 3. Conditionally render the helper link if they fail more than once */}
      {failedAttempts > 1 && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeeba",
            borderRadius: "5px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 10px 0", color: "#856404" }}>
            Having trouble logging in?
          </p>
          <Link
            to="/forgot-password"
            style={{
              color: "#0056b3",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Click here to reset your password
          </Link>
        </div>
      )}
      {/* 👈 2. Add this link right below your form */}
      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Don't have an account? <Link to="/register">Register Staff</Link>
      </p>
    </div>
  );
}
