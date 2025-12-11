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
    if (!user_id || !product_id) {
      throw new Error("Missing user_id or product_id");
    }

    const payload = { user_id, product_id };
    const res = await api.post(`/wishlist/add/`, payload);
    return res.data;
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
