import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// // 2. REQUEST INTERCEPTOR: Automatically attach the token to every outgoing request
api.interceptors.request.use(
  (config) => {
    // Look for the token in local storage
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
// // 3. RESPONSE INTERCEPTOR: The Magic "Silent Refresh"
// 3. RESPONSE INTERCEPTOR: The Magic "Silent Refresh"
api.interceptors.response.use(
  (response) => {
    // If the request succeeds normally, just pass it through
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) AND we haven't tried refreshing yet
    // AND the user isn't currently trying to log in...
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("login")
    ) {
      originalRequest._retry = true; // Set a flag so we don't get stuck in an infinite loop

      const refreshToken = localStorage.getItem("refresh");

      if (refreshToken) {
        try {
          // 1. Ask Django for a brand new access token
          const response = await axios.post(
            "http://localhost:8000/api/accounts/token/refresh/",
            {
              refresh: refreshToken,
            },
          );

          // 2. Save the new token to localStorage
          localStorage.setItem("access", response.data.access);

          // 3. Update the failed request with the new token and TRY AGAIN
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If the refresh token is ALSO expired, force a hard logout
          console.error("Session expired. Please log in again.");
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login"; // Redirect to login page
          return Promise.reject(refreshError);
        }
      }
    }

    // If it was a different error (like 404 Not Found), just reject it normally
    return Promise.reject(error);
  },
);

export default api;
