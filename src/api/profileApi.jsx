import api from './api';
import { API_ENDPOINTS } from "./endpoints";

export const profileApi = {
    // --- USER PROFILE ---

    // Get User Profile
    getProfile: async () => {
        const response = await api.get(API_ENDPOINTS.PROFILES);
        return response.data;
    },

    // Update User Profile
    updateProfile: async (userData) => {
        const response = await api.put(API_ENDPOINTS.USER_PROFILE_EDIT, userData);
        return response.data;
    },

    // --- ADDRESSES ---

    // GET: List all addresses
    fetchAddresses: async (userId) => {
        const response = await api.get(API_ENDPOINTS.ADDRESSES, {
            params: { user_id: userId }
        });
        return response.data;
    },

    // POST: Add new address
    addAddress: async (addressData) => {
        const response = await api.post(API_ENDPOINTS.ADDRESS_ADD, addressData);
        return response.data;
    },

    // PUT: Update address
    updateAddress: async (id, addressData) => {
        const response = await api.put(API_ENDPOINTS.ADDRESS_UPDATE(id), addressData);
        return response.data;
    },

    // DELETE: Delete address
    deleteAddress: async (id) => {
        const response = await api.delete(API_ENDPOINTS.ADDRESS_DELETE(id));
        return response.data;
    }
};