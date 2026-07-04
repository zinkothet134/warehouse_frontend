// src/components/Auth/PasswordResetConfirm.jsx
import { useState } from "react";
import {
  useSearchParams,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import api from "../../libs/api";

export default function PasswordResetConfirm() {
  // This hook grabs the ?uidb64=...&token=... from the URL
  // const [searchParams] = useSearchParams();
  // const uidb64 = searchParams.get("uidb64");
  // const token = searchParams.get("token");
  const location = useLocation();
  const navigate = useNavigate();
  // 1. Grab the email that was passed from the previous screen
  const userEmail = location.state?.email || "";

  // 2. Manage the multi-step flow
  const [step, setStep] = useState(1); // Step 1: OTP, Step 2: Password
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  if (!userEmail) {
    return (
      <div
        style={{
          maxWidth: "400px",
          margin: "50px auto",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        <h3 style={{ color: "red" }}>Missing Information</h3>
        <p>We don't know which account to reset.</p>
        <Link to="/forgot-password">Click here to start over</Link>
      </div>
    );
  }

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    // Just a quick frontend check before moving to the next step
    if (otp.length === 6) {
      setStep(2);
      setError(null);
    } else {
      setError("Please enter a valid 6-digit code.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const response = await api.post("accounts/password-reset-confirm/", {
        // uidb64: uidb64,
        // token: token,
        email: userEmail,
        otp: otp,
        password: password,
      });
      setMessage("Password reset successfully!");
      setPassword("");
      alert("Password reset successfully! You can now log in.");
      navigate("/login"); // Send them straight back to the login door
    } catch (err) {
      // If Django rejects the OTP (e.g., expired or wrong), send them back to Step 1
      setError("This code is invalid or has expired. Please try again.");
      setStep(1);
      setOtp("");
    }
  };

  // Safety check: if someone visits this page without clicking an email link
  // if (!uidb64 || !token) {
  //   return (
  //     <div
  //       style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}
  //     >
  //       <h3 style={{ color: "red" }}>Invalid Link</h3>
  //       <p>
  //         You are missing the required security tokens. Please use the exact
  //         link sent to your email.
  //       </p>
  //       <Link to="/forgot-password">Request a new link</Link>
  //     </div>
  //   );
  // }

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        fontFamily: "sans-serif",
      }}
    >
      {/* STEP 1: ENTER OTP */}
      {step === 1 && (
        <>
          <h2>Check Your Email</h2>
          <p>
            We sent a 6-digit code to <strong>{userEmail}</strong>.
          </p>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <form
            onSubmit={handleOtpSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={{
                letterSpacing: "5px",
                fontSize: "1.2rem",
                textAlign: "center",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px",
                cursor: "pointer",
                backgroundColor: "#3b82f6",
                color: "white",
              }}
            >
              Verify Code
            </button>
          </form>
        </>
      )}

      {/* STEP 2: ENTER NEW PASSWORD */}
      {step === 2 && (
        <>
          <h2>Create New Password</h2>
          <p>Almost done! Choose a new secure password.</p>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <form
            onSubmit={handlePasswordSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <input
              type="password"
              placeholder="New Password (min 8 chars)"
              minLength="8"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              style={{
                padding: "10px",
                cursor: "pointer",
                backgroundColor: "#10b981",
                color: "white",
              }}
            >
              Save New Password
            </button>
          </form>

          <button
            onClick={() => setStep(1)}
            style={{
              marginTop: "10px",
              background: "none",
              border: "none",
              color: "#6b7280",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Wait, I need to fix my OTP
          </button>
        </>
      )}
    </div>
  );
}
