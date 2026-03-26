import api, { setAuthToken } from "./api";
import { API_ENDPOINTS } from "./endpoints";

// ===========================
// INITIALIZE USER ON APP LOAD
// ===========================
const existingUserId = localStorage.getItem("user_id");

if (existingUserId) {
  console.log("User session restored:", existingUserId);
}

// ===========================
// AUTH SERVICE
// ===========================
export const authService = {

  login: async (mobile_number, password) => {
    try {
      const payload = {
        username: mobile_number,   // Standard DRF Identifier
        mobile: mobile_number,     // Common Custom Identifier
        mobile_number: mobile_number, 
        phone: mobile_number,      // Alternative Custom Identifier
        password: password,
      };

      console.log("🚀 [authService] Sending login payload:", { ...payload, password: '***' });

      const res = await api.post(API_ENDPOINTS.LOGIN, payload);

      console.log("Login full response:", res.data);

      // ✅ Dynamically extract and store ACCESS TOKEN
      const accessToken = res.data.access || res.data.token || res.data.access_token || res.data.jwt_token || res.data.accessToken || null;
      if (accessToken) {
        localStorage.setItem("accessToken", String(accessToken));
        setAuthToken(accessToken); // Set in Axios headers immediately
        console.log("✅ [authService] Access token stored");
      }

      // ✅ Dynamically extract and store REFRESH TOKEN
      const refreshToken = res.data.refresh || res.data.refresh_token || res.data.refreshToken || null;
      if (refreshToken) {
        localStorage.setItem("refreshToken", String(refreshToken));
        console.log("✅ [authService] Refresh token stored");
      }

      // ✅ Dynamically extract and store USER ID
      const userData = res.data.user || res.data.customer || (res.data.id ? res.data : null);
      const userId = userData?.id || userData?.user_id || res.data.user_id || res.data.id;
      if (userId) {
        localStorage.setItem("user_id", String(userId));
        console.log("✅ [authService] User ID stored:", userId);
      } else {
        console.warn("⚠️ Login response OK, but userId not found. Check response structure.", res.data);
      }

      return res.data;

    } catch (error) {
      console.error("Login API Error:", error.response?.data || error.message);
      
      // Extract a meaningful error message
      const errorData = error.response?.data;
      let errorMessage = "Login failed";
      
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  },

  // -------------------------
  // REGISTER
  // POST /register/user/
  // -------------------------
  register: async (userData) => {
    try {
      const res = await api.post(API_ENDPOINTS.REGISTER, userData);

      const userId = res.data.user?.id || res.data.user_id || res.data.id;
      const lat = res.data.user?.latitude || res.data.latitude;
      const lon = res.data.user?.longitude || res.data.longitude;

      // Save location
      if (lat && lon) {
        localStorage.setItem("latitude", String(lat));
        localStorage.setItem("longitude", String(lon));
      }

      if (userId) {
        localStorage.setItem("user_id", String(userId));
      }

      return res.data;
    } catch (error) {
      throw error.response?.data || new Error("Registration failed");
    }
  },

  // -------------------------
  // LOGOUT
  // -------------------------
  
  logout: () => {
  // ✅ Remove all variations of auth data
  localStorage.removeItem("accessToken");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  // ✅ Remove other stored data
  localStorage.removeItem("user_id");
  localStorage.removeItem("latitude");
  localStorage.removeItem("longitude");

  // ✅ Remove token from axios
  setAuthToken(null);
  console.log("Logout explicit scrub successful");
},

};
// Compatibility alias
export const customerService = authService;