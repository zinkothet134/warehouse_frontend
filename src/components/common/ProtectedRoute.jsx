import { Navigate } from "react-router-dom";

import React from "react";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access");

  if (!token) {
    return <Navigate to={"/login"} replace />;
  }
  return children;
}
