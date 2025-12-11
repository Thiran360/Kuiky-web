import api from "./api"; // Assuming 'api' is an Axios instance configured with setAuthToken

export const profileService = {
  // GET logged-in user profile
  getProfile: async () => {
    try {
      const res = await api.get("/profiles/me/");
      return res.data;
    } catch (error) {
      console.error("GET Profile Error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  // PUT update profile
  updateProfile: async (payload) => {
    try {
      // Endpoint used in your screenshots: /user-profile/edit/
      const res = await api.put("/user-profile/edit/", payload); 
      return res.data; // CRUCIAL: Must return the COMPLETE, updated user object
    } catch (error) {
      console.error("PUT Update Error:", error.response?.data || error);
      throw error.response?.data || error;
    }
  },
};