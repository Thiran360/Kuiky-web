import api from "./api";
import { API_ENDPOINTS } from "./endpoints";

export const addressService = {

  // GET ALL ADDRESSES
  // userId can be a numeric ID or mobile number string — backend varies
  getAll: async (userId) => {
    try {
      const res = await api.get(API_ENDPOINTS.ADDRESSES, {
        params: { user_id: userId }
      });
      if (Array.isArray(res.data)) return res.data;
      if (res.data?.addresses && Array.isArray(res.data.addresses)) return res.data.addresses;
      if (res.data?.results && Array.isArray(res.data.results)) return res.data.results;
      if (res.data?.items && Array.isArray(res.data.items)) return res.data.items;
      return [];
    } catch (error) {
      console.warn("Addresses API not found on backend (Customer not registered in DB):", error?.response?.data || error?.message);
      try {
        const local = localStorage.getItem("ecom_local_addresses");
        return local ? JSON.parse(local) : [];
      } catch (e) {
        return [];
      }
    }
  },

  // GET ALL (token-only, no user_id — for backends that resolve from JWT)
  getAllTokenBased: async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADDRESSES);
      if (Array.isArray(res.data)) return res.data;
      if (res.data?.addresses && Array.isArray(res.data.addresses)) return res.data.addresses;
      if (res.data?.results && Array.isArray(res.data.results)) return res.data.results;
      if (res.data?.items && Array.isArray(res.data.items)) return res.data.items;
      return [];
    } catch (error) {
      try {
        const local = localStorage.getItem("ecom_local_addresses");
        return local ? JSON.parse(local) : [];
      } catch (e) {
        return [];
      }
    }
  },

  // ADD NEW ADDRESS
  add: async (data) => {
    const res = await api.post(API_ENDPOINTS.ADDRESS_ADD, data);
    return res.data;
  },

  // UPDATE ADDRESS
  update: async (id, data) => {
    const res = await api.put(API_ENDPOINTS.ADDRESS_UPDATE(id), data);
    return res.data;
  },

  // --------------------------
  // PRIMARY DELETE METHOD
  // --------------------------
  remove: async (id) => {
    return api.delete(API_ENDPOINTS.ADDRESS_DELETE(id));
  },

  // --------------------------
  // DELETE WITH ?user_id=123
  // (most Django APIs require this)
  // --------------------------
  removeWithUser: async (id, userId) => {
    return api.delete(API_ENDPOINTS.ADDRESS_DELETE(id), {
      params: { user_id: userId },
    });
  },

  // --------------------------
  // DELETE with body (Django sometimes requires this)
  // --------------------------
  removeWithBody: async (id, userId) => {
    return api.delete(API_ENDPOINTS.ADDRESS_DELETE(id), {
      data: { user_id: userId },
    });
  }
};
