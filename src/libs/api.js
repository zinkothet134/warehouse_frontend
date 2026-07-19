import axios from "axios";

// --- 1. EXTRACT TENANT PREFIX ---
// Extracts the subdomain from the frontend URL to use for the backend URL
const getTenantPrefix = () => {
  const host = window.location.hostname;

  // Localhost handling (e.g., mandalay.localhost)
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    const parts = host.split(".");
    return parts.length > 1 && parts[0] !== "www" ? parts[0] : "api";
  }

  // Production handling (e.g., mandalay.chuefamily.online)
  const parts = host.split(".");
  if (parts.length >= 3 && parts[0] !== "www") {
    return parts[0]; // Returns "mandalay"
  }

  // Fallback to the main/public API
  return "api";
};

// --- 2. DYNAMIC BASE URL SETUP ---
const getBaseUrl = () => {
  // Allow local development override (e.g., pointing to localhost:8000 via VITE_API_BASE_URL)
  if (import.meta.env.DEV && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  const prefix = getTenantPrefix();

  // FORMATTING THE NEW SUBDOMAIN ARCHITECTURE
  // If the prefix is "api" (public tenant), leave it as "api"
  // If it is a specific tenant (like "mandalay"), format it as "api-mandalay"
  const backendSubdomain = prefix === "api" ? "api" : `api-${prefix}`;

  // Dynamically constructs:
  // https://api-mandalay.chuefamily.online/api/ OR https://api.chuefamily.online/api/
  return `https://${backendSubdomain}.chuefamily.online/api/`;
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
});

// --- 3. REQUEST INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // No custom tenant header needed; Django-tenants reads the Host from the URL we just constructed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// --- 4. RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("login")
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh");

      if (refreshToken) {
        try {
          // The refresh request will automatically go to the correct
          // tenant domain because API_BASE_URL is dynamically built with "api-tenant"
          const response = await axios.post(
            `${API_BASE_URL}accounts/token/refresh/`,
            { refresh: refreshToken },
          );

          localStorage.setItem("access", response.data.access);

          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Session expired. Please log in again.");
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
