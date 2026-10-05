import api from "./api";
import { API_ENDPOINTS } from "./endpoints";

export const profileService = {
  // GET logged-in user profile
  getProfile: async () => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const isCustomOtp = token && (token.startsWith("otp_") || token.startsWith("token_"));

    if (!token || isCustomOtp) {
      try {
        const raw = localStorage.getItem("user_profile");
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }

    try {
      const endpoint = API_ENDPOINTS.PROFILES || "profiles/";
      const res = await api.get(endpoint);
      return res.data;
    } catch (error) {
      console.warn("GET Profile Error fallback to local profile:", error.response?.data || error);
      try {
        const raw = localStorage.getItem("user_profile");
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }
  },

  // PUT update profile
  updateProfile: async (payload) => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const isCustomOtp = token && (token.startsWith("otp_") || token.startsWith("token_"));

    // If dev / OTP session without a real backend JWT, update client state without firing failing 401
    if (!token || isCustomOtp) {
      return { success: true, localOnly: true, user: payload };
    }

    try {
      const endpoint = API_ENDPOINTS.USER_PROFILE_EDIT || "user-profile/edit/";
      const res = await api.put(endpoint, payload);
      return res.data;
    } catch (error) {
      console.warn("PUT Update Error fallback to local state:", error.response?.data || error);
      return { success: true, localOnly: true, user: payload };
    }
  },
};