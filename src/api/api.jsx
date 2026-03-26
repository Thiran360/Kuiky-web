import axios from "axios";
import { API_BASE_URL, ECOM_API_PATH, COMMON_HEADERS } from "./config";
import { API_ENDPOINTS } from "./endpoints";

// ===========================
// AXIOS INSTANCE
// ===========================
const api = axios.create({
  baseURL: `${API_BASE_URL}${ECOM_API_PATH}`,
  headers: {
    ...COMMON_HEADERS,
    "ngrok-skip-browser-warning": "true",
  },
});

// ===========================
// UTILITIES
// ✅ Set / Remove token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};


const getUserId = () => {
  const storedId = localStorage.getItem("user_id");
  if (storedId && storedId !== "undefined" && storedId !== "null") return storedId;
  
  const raw = localStorage.getItem("ecom_auth_data");
  if (raw && raw !== "undefined" && raw !== "null") {
    try {
      const parsed = JSON.parse(raw);
      const uid = parsed.user?.id || parsed.user?.user_id || parsed.id || parsed.user_id;
      if (uid && uid !== "undefined" && uid !== "null") return String(uid);
    } catch (e) { return null; }
  }
  return null;
};

const getToken = () => {
  // 1. Try auth data object (Most Auth Systems store it here)
  const raw = localStorage.getItem("ecom_auth_data");
  if (raw && raw !== "undefined" && raw !== "null") {
    try {
      const parsed = JSON.parse(raw);
      const token = parsed.access || parsed.token || parsed.access_token || parsed.jwt_token || parsed.accessToken;
      if (token && token !== "undefined" && token !== "null") return token;
    } catch (e) { /* fallback */ }
  }
  
  // 2. Try standalone keys (User requested explicit access_token/accessToken storage)
  const standalone = localStorage.getItem("access_token") || 
                     localStorage.getItem("accessToken") || 
                     localStorage.getItem("token") ||
                     localStorage.getItem("jwt");
                     
  if (standalone && standalone !== "undefined" && standalone !== "null") return standalone;
  return null;
};

// ===========================
// INTERCEPTOR - AUTH & USER ID
// ===========================
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    const userId = getUserId();

    // Skip attaching for auth discovery endpoints
    const url = config.url || "";
    const isAuthEndpoint = 
      url.includes(API_ENDPOINTS.LOGIN) || 
      url.includes(API_ENDPOINTS.REGISTER) ||
      url.includes(API_ENDPOINTS.BANNERS) ||
      url.includes("token/refresh/");

    if (!isAuthEndpoint && token) {
      // ✅ FORCE ATTACH LATEST TOKEN
      config.headers.Authorization = `Bearer ${token}`;
      
      // ✅ PASS USER_ID AUTOMATICALLY FOR BACKEND IDENTIFICATION
      if (userId) {
         // Some endpoints expect user_id in params (Query String)
         config.params = { ...config.params, user_id: userId };
         
         // Some endpoints expect user_id in body (POST/PUT/PATCH)
         if (['post', 'put', 'patch'].includes(config.method?.toLowerCase())) {
            if (config.data instanceof FormData) {
                // If FormData, append if not present
                if (!config.data.has('user_id')) {
                    config.data.append('user_id', userId);
                }
            } else if (config.data && typeof config.data === 'object') {
                // If JSON object, merge
                config.data = { user_id: userId, ...config.data };
            } else if (!config.data) {
                // If no data, provide user_id object
                config.data = { user_id: userId };
            }
         }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized API call! Backend responded with 401. Awaiting explicit user logout to clear session.");
      // ✅ Removed aggressive automatic local storage wipe to prevent premature loss of user_id and tokens.
      // Session tear-down is now strictly handled by the UserContext logout() or authService logout() method.
    }
    return Promise.reject(error);
  }
);

// ===========================
// PRODUCTS
// ===========================
export const fetchProducts = async (filters = {}) => {
  const { categoryId, search } = filters;
  const params = {};

  if (categoryId) params.category_id = categoryId;
  if (search) params.search = search;

  try {
    const res = await api.get(API_ENDPOINTS.PRODUCTS, { params });
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  } catch (error) {
    console.error("fetchProducts error:", error);
    return [];
  }
};

export const fetchPopularProducts = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.POPULAR_PRODUCTS);
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  } catch (error) {
    console.error("Failed to fetch popular products:", error);
    return [];
  }
};

export const fetchProductDetail = async (productId) => {
  try {
    const res = await api.get(API_ENDPOINTS.PRODUCT_DETAIL(productId));
    return res.data;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    throw error;
  }
};

export const fetchProductVariations = async (productId) => {
  try {
    const res = await api.get(API_ENDPOINTS.PRODUCT_VARIATIONS(productId));
    return res.data;
  } catch (error) {
    console.error("Failed to fetch variations:", error);
    return [];
  }
};

// ===========================
// CATEGORIES
// ===========================
export const fetchCategories = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.CATEGORIES);
    return res.data;
  } catch (error) {
    return [];
  }
};

export const fetchSubCategories = async (categoryId, parentSubcategoryId) => {
  try {
    const params = {};

    if (categoryId) params.category_id = categoryId;
    if (parentSubcategoryId) params.parent_subcategory_id = parentSubcategoryId;

    const res = await api.get(API_ENDPOINTS.SUBCATEGORIES, { params });

    return Array.isArray(res.data) ? res.data : res.data.results || [];
  } catch (error) {
    return [];
  }
};

// ===========================
// BANNERS
// ===========================
export const fetchBanners = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.BANNERS);
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  } catch (error) {
    console.error("Banners fetch failed:", error);
    return [];
  }
};

// ===========================
// CART SERVICE
// ===========================
export const cartService = {
  fetchCart: async () => {
    const userId = getUserId();

    try {
      const res = await api.get(API_ENDPOINTS.CART, {
        params: { user_id: userId },
      });
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  addToCart: async (productVariantId, quantity) => {
    const userId = getUserId();

    const payload = {
      user_id: userId,
      product_variation: productVariantId,
      quantity,
    };

    try {
      const res = await api.post(API_ENDPOINTS.CART_ADD, payload);
      return res.data;
    } catch (error) {
      throw error.response?.data || "Add to cart failed";
    }
  },

  updateToCart: async (id, quantity) => {
    const userId = getUserId();

    try {
      const res = await api.put(API_ENDPOINTS.CART_UPDATE_QUANTITY(id), {
        user_id: userId,
        quantity,
      });

      return res.data;
    } catch (error) {
      throw error.response?.data || "Update cart failed";
    }
  },

  deleteCartItem: async (cartId) => {
    const userId = getUserId();

    try {
      const res = await api.delete(API_ENDPOINTS.CART_REMOVE(cartId), {
        params: { user_id: userId },
      });

      return res.data;
    } catch (error) {
      throw error.response?.data || "Delete cart item failed";
    }
  },

  clearCart: async () => {
    const userId = getUserId();

    try {
      const res = await api.delete(API_ENDPOINTS.CART_CLEAR, {
        params: { user_id: userId },
      });

      return res.data;
    } catch (error) {
      throw error.response?.data || "Clear cart failed";
    }
  },

  orderFromCart: async (orderData) => {
    const userId = getUserId();

    try {
      const res = await api.post(API_ENDPOINTS.PLACE_ORDER_CART, {
        ...orderData,
        user_id: userId,
      });

      return res.data;
    } catch (error) {
      throw error.response?.data || "Order failed";
    }
  },

  orderDirectly: async (orderData) => {
    const userId = getUserId();

    try {
      const res = await api.post(API_ENDPOINTS.PLACE_ORDER_DIRECT, {
        ...orderData,
        user_id: userId,
      });

      return res.data;
    } catch (error) {
      throw error.response?.data || "Direct order failed";
    }
  },
};

// ===========================
// GENERIC REQUESTS
// ===========================
export const getRequest = (url, params = {}) => api.get(url, { params });
export const postRequest = (url, data = {}) => api.post(url, data);
export const putRequest = (url, data = {}) => api.put(url, data);
export const deleteRequest = (url) => api.delete(url);

export default api;