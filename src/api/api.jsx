// services/api.js
import axios from "axios";
import { API_BASE_URL, ECOM_API_PATH, COMMON_HEADERS } from "./config";

// ===========================
// 🛠 AXIOS INSTANCE SETUP
// ===========================
const api = axios.create({
  baseURL: `${API_BASE_URL}${ECOM_API_PATH}`,
  headers: COMMON_HEADERS,
});

// Helper retrieves token
const getAccessToken = () => localStorage.getItem("accessToken");

// ===========================
// 🔐 SAVE TOKEN + SYNC AXIOS
// ===========================
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("accessToken", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common["Authorization"];
  }
};

// ===========================
// 🛡 INTERCEPTOR — AUTO ATTACH TOKEN
// ===========================
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["ngrok-skip-browser-warning"] = "true";
    return config;
  },
  (error) => Promise.reject(error)
);

// ===========================
// 📦 PUBLIC API FETCHERS
// ===========================
export const fetchProducts = async () => {
  try {
    const res = await api.get("/products/");
    return res.data;
  } catch {
    return [];
  }
};

export const fetchCategories = async () => {
  try {
    const res = await api.get("/categories/");
    return res.data;
  } catch {
    return [];
  }
};

/**
 * Fetches subcategories with optional filtering based on the provided API structure.
 * * Query Params Supported:
 * 1. category_id: Filters subcategories belonging to a specific category.
 * 2. parent_subcategory_id: Filters by parent ID. Use the string 'null' for top-level subcategories.
 * * @param {number|string} [categoryId] - Filters subcategories by this category ID.
 * @param {number|string|'null'} [parentSubcategoryId] - Filters by parent ID. Use the string 'null' for top-level subcategories.
 * @returns {Promise<Array>} List of subcategories.
 */
export const fetchSubCategories = async (categoryId, parentSubcategoryId) => {
  try {
    const params = {};

    // 1. Handle category_id (Optional)
    // Add only if explicitly provided (not undefined and not null)
    if (categoryId !== undefined && categoryId !== null) {
      params.category_id = categoryId;
    }

    // 2. Handle parent_subcategory_id (Optional, accepts 'null' string)
    // Add only if explicitly provided (not undefined)
    if (parentSubcategoryId !== undefined) {
      params.parent_subcategory_id = parentSubcategoryId;
    }

    // Axios will automatically serialize the 'params' object into the correct query string
    const res = await api.get("/subcategories/", { params });
    return res.data;
  } catch {
    return [];
  }
};

export const fetchBanners = async () => {
  try {
    const res = await api.get("/banners/");
    return res.data;
  } catch {
    return [];
  }
};

// ===========================
// 🛒 CART SERVICE (AUTHENTICATED)
// ===========================
export const cartService = {
  // GET CART ITEMS
  fetchCart: async () => {
    try {
      const res = await api.get("/cart/");
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ADD ITEM TO CART
  addToCart: async (productVariantId, quantity) => {
    const payload = {
      product_variation: productVariantId || null,
      quantity,
    };

    try {
      const res = await api.post("/cart/add/", payload);
      return res.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw { message: "Unauthorized. Please log in again.", status: 401 };
      }
      throw error.response?.data || new Error("Add to Cart Failed");
    }
  },

  // UPDATE ITEM QUANTITY
  updateToCart: async (id, quantity) => {
    const payload = { quantity };
    try {
      const res = await api.put(`/cart/update-quantity/${id}/`, payload);
      return res.data;
    } catch (error) {
      throw error.response?.data || new Error("Update to Cart Failed");
    }
  },

  // DELETE ITEM FROM CART
  deleteCartItem: async (cartId) => {
    try {
      const res = await api.delete(`/cart/remove/${cartId}/`);
      return res.data;
    } catch (error) {
      throw error.response?.data || new Error("Delete Cart Item Failed");
    }
  },

  // SUBMIT ORDER FROM CART
  orderFromCart: async (orderData) => {
    try {
      const res = await api.post("/order-from-cart/", orderData);
      // const res = await api.post("/place-order-directt/", orderData);

      return res.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw { message: "Unauthorized. Please log in again.", status: 401 };
      }
      throw error.response?.data || new Error("Order Submission Failed");
    }
  },

  // RENAMED for clarity to match the direct order endpoint
orderDirectly: async (orderData) => { 
    try {
        // USE THE NEW DIRECT ORDER ENDPOINT
        const res = await api.post("/place-order-directt/", orderData); 

        return res.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw { message: "Unauthorized. Please log in again.", status: 401 };
        }
        throw error.response?.data || new Error("Direct Order Submission Failed");
    }
},
};

export default api;