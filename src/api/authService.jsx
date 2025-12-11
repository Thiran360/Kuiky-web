// src/api/authService.js
import api, { setAuthToken } from "./api";

// ===========================
// INITIALIZE TOKEN ON APP LOAD
// ===========================
const existingToken = localStorage.getItem("accessToken");
if (existingToken) {
  setAuthToken(existingToken);
}

// ===========================
// 🔐 AUTH SERVICE
// ===========================
export const authService = {
  // -------------------------
  // LOGIN
  // POST /login/
  // -------------------------
  login: async (mobile_number, password) => {
    try {
      const res = await api.post("/login/", {
        mobile_number,
        password,
      });

      const token = res.data.access;
      const userId = res.data.user?.id;

      if (!token) {
        throw new Error("Login successful, but token missing.");
      }

      // Store token + user id
      setAuthToken(token);
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user_id", String(userId));

      return res.data;
    } catch (error) {
      throw error.response?.data || new Error("Login failed");
    }
  },

  // -------------------------
  // REGISTER
  // POST /register/user/
  // -------------------------
  register: async (userData) => {
    try {
      const res = await api.post("/register/user/", userData);

      const token = res.data.access;
      const userId = res.data.user?.id;

      if (!token) {
        console.warn("Registration success but token missing", res.data);
      } else {
        setAuthToken(token);
        localStorage.setItem("accessToken", token);
        localStorage.setItem("user_id", String(userId));
      }

      return res.data;
    } catch (error) {
      throw error.response?.data || new Error("Registration failed");
    }
  },

  // -------------------------
  // CHECK MOBILE OR EMAIL AVAILABILITY
  // POST /check-availability/
  // -------------------------
  checkAvailability: async (type, value) => {
    try {
      const res = await api.post("/check-availability/", { type, value });
      return res.data;
    } catch (error) {
      // If API fails, assume available to avoid blocking user
      return { isAvailable: true };
    }
  },

  // -------------------------
  // LOGOUT
  // -------------------------
  logout: () => {
    setAuthToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user_id");
  },
};

// Compatibility alias
export const customerService = authService;
