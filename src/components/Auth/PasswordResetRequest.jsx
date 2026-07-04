// src/components/Auth/PasswordResetRequest.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../libs/api";

export default function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("accounts/password-reset/", { email });
      setMessage(
        response.data.success || "Check your email for the reset link.",
      );
      navigate("/reset-password", { state: { email: email } });
      setEmail(""); // Clear the input
    } catch (err) {
      setError("Failed to send reset email. Make sure the email is correct.");
    } finally {
      setIsLoading(false);
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
      <h2>Reset Password</h2>
      <p>Enter your email address and we will send you a 6-digit reset code.</p>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "10px",
            cursor: "pointer",
            backgroundColor: "#333",
            color: "white",
          }}
        >
          {isLoading ? "Sending..." : "Send Reset Code"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Remember your password? <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}
