// src/api/wishlistService.js

import api from "./api";

export const wishlistService = {
  // ------------------------------
  // GET WISHLIST
  // ------------------------------
  fetchWishlist: async (user_id) => {
    if (!user_id) return [];
    const res = await api.get(`/wishlist/?user_id=${user_id}`);
    return res.data;
  },

  // ------------------------------
  // ADD ITEM
  // ------------------------------
  addToWishlist: async ({ user_id, product_id }) => {
    // If user_id is missing, we might still succeed if backend uses token, 
    // but product_id is definitely needed.
    if (!product_id) {
      throw new Error("Missing product_id");
    }

    // Include both 'product_id' and 'product' to support different backend variations
    const payload = {
      product_id,
      product: product_id
    };

    // Only add user_id if it's provided and not null
    if (user_id) {
      payload.user_id = user_id;
    }

    try {
      const res = await api.post(`/wishlist/add/`, payload);
      return res.data;
    } catch (error) {
      console.error("Wishlist Add API Error:", error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // ------------------------------
  // REMOVE ITEM (COMPLETELY FIXED)
  // ------------------------------
  removeFromWishlist: async (product_id) => {
    if (!product_id) throw new Error("Invalid product");

    // Backend expects: /wishlist/remove/<product_id>/
    const res = await api.delete(`/wishlist/remove/${product_id}/`);

    return res.data;
  },
};
