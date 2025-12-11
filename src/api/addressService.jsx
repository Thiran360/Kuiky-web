// src/api/addressService.js
import api from "./api";

export const addressService = {

  // GET ALL ADDRESSES
  getAll: async (userId) => {
    const res = await api.get(`/addresses/?user_id=${userId}`);
    return res.data;
  },

  // ADD NEW ADDRESS
  add: async (data) => {
    const res = await api.post("/addresses/add/", data);
    return res.data;
  },

  // UPDATE ADDRESS
  update: async (id, data) => {
    const res = await api.put(`/addresses/update/${id}/`, data);
    return res.data;
  },

  // --------------------------
  // PRIMARY DELETE METHOD
  // --------------------------
  remove: async (id) => {
    return api.delete(`/addresses/delete/${id}/`);
  },

  // --------------------------
  // DELETE WITH ?user_id=123
  // (most Django APIs require this)
  // --------------------------
  removeWithUser: async (id, userId) => {
    return api.delete(`/addresses/delete/${id}/`, {
      params: { user_id: userId },
    });
  },

  // --------------------------
  // DELETE with body (Django sometimes requires this)
  // --------------------------
  removeWithBody: async (id, userId) => {
    return api.delete(`/addresses/delete/${id}/`, {
      data: { user_id: userId },
    });
  }
};
