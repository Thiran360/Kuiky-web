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

export const fetchSubCategories = async () => {
  try {
    const res = await api.get("/subcategories/");
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
      return res.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw { message: "Unauthorized. Please log in again.", status: 401 };
      }
      throw error.response?.data || new Error("Order Submission Failed");
    }
  },
};

export default api;
