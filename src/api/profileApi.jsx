// src/api/profileApi.js
import axios from 'axios';

const BASE_URL = 'https://39946e6edbbb.ngrok-free.app/ecomapp'; // Your API Base URL

// Helper to get token
const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return { headers: { Authorization: `Bearer ${token}` } };
};


export const profileApi = {
    // --- USER PROFILE ---

    // Get User Profile
    getProfile: async () => {
        const response = await axios.get(`${BASE_URL}/profiles/`, getAuthHeader());
        return response.data;
    },

    // Update User Profile
    updateProfile: async (userData) => {
        const response = await axios.put(`${BASE_URL}/profiles/update/`, userData, getAuthHeader());
        return response.data;
    }, // <--- Added missing comma here

    // --- ADDRESSES ---

    // GET: List all addresses
    fetchAddresses: async (userId) => {
        const response = await axios.get(`${BASE_URL}/addresses/?user_id=${userId}`, getAuthHeader());
        return response.data;
    },

    // POST: Add new address
    addAddress: async (addressData) => {
        const response = await axios.post(`${BASE_URL}/addresses/add/`, addressData, getAuthHeader());
        return response.data;
    },

    // PUT: Update address
    updateAddress: async (id, addressData) => {
        const response = await axios.put(`${BASE_URL}/addresses/update/${id}/`, addressData, getAuthHeader());
        return response.data;
    },

    // DELETE: Delete address
    deleteAddress: async (id) => {
        const response = await axios.delete(`${BASE_URL}/addresses/delete/${id}/`, getAuthHeader());
        return response.data;
    }
};