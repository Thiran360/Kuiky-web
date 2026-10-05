// src/api/wishlistService.js

import api, { getToken, getUserId } from "./api";
import { API_ENDPOINTS } from "./endpoints";

export const wishlistService = {
  // ------------------------------
  // GET WISHLIST
  // ------------------------------
  fetchWishlist: async (userIdParam) => {
    const userId = userIdParam || getUserId();
    const token = getToken();

    // If no JWT token or in dev/mock OTP session, read local wishlist directly (avoids 401 network error)
    const isRealJwt = token && typeof token === "string" && token.includes(".") && !token.startsWith("otp_") && !token.startsWith("token_");
    if (!isRealJwt) {
      try {
        const local = localStorage.getItem("localWishlist");
        return local ? JSON.parse(local) : [];
      } catch (e) {
        return [];
      }
    }

    try {
      // Axios request interceptor automatically attaches ?user_id=${userId} and Bearer token
      const res = await api.get(API_ENDPOINTS.WISHLIST);
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data?.results)) return res.data.results;
      if (Array.isArray(res.data?.items)) return res.data.items;
      return [];
    } catch (error) {
      try {
        const local = localStorage.getItem("localWishlist");
        return local ? JSON.parse(local) : [];
      } catch (e) {
        return [];
      }
    }
  },

  // ------------------------------
  // ADD ITEM
  // ------------------------------
  addToWishlist: async ({ user_id, product_id }) => {
    if (!product_id) {
      throw new Error("Missing product_id");
    }

    const token = getToken();
    const isRealJwt = token && typeof token === "string" && token.includes(".") && !token.startsWith("otp_") && !token.startsWith("token_");
    const uid = user_id || getUserId();

    if (!isRealJwt) {
      return { success: true, localOnly: true, product_id };
    }

    // Include both 'product_id' and 'product' to support different backend variations
    const payload = {
      product_id,
      product: product_id,
      ...(uid ? { user_id: uid } : {})
    };

    try {
      const res = await api.post(API_ENDPOINTS.WISHLIST_ADD, payload);
      return res.data;
    } catch (error) {
      console.warn("Server wishlist add returned error, maintaining local state:", error?.response?.data || error?.message);
      return { success: true, localOnly: true, product_id };
    }
  },

  // ------------------------------
  // REMOVE ITEM
  // ------------------------------
  removeFromWishlist: async (product_id) => {
    if (!product_id) throw new Error("Invalid product");

    const token = getToken();
    const isRealJwt = token && typeof token === "string" && token.includes(".") && !token.startsWith("otp_") && !token.startsWith("token_");

    if (!isRealJwt) {
      return { success: true, localOnly: true };
    }

    try {
      const res = await api.delete(API_ENDPOINTS.WISHLIST_REMOVE(product_id));
      return res.data;
    } catch (error) {
      console.warn("Server wishlist remove returned error, maintaining local state:", error?.response?.data || error?.message);
      return { success: true, localOnly: true };
    }
  },
};
