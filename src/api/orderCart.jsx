// src/api/orderApi.js
import axios from "axios";

const BASE_URL_ORDER = "https://39946e6edbbb.ngrok-free.app/ecomapp";

const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const orderApi = {
    fetchOrders: async (userId) => {
        const response = await axios.get(
            `${BASE_URL_ORDER}/user-orders/?user_id=${userId}`,
            getAuthHeader()
        );

        const data = response.data;

        // ⭐ UNIVERSAL NORMALIZER (supports all backend variations)
        const possibleKeys = [
            "orders",
            "order",
            "results",
            "data",
            "order_list",
            "orders_list",
            "user_orders",
        ];

        for (const key of possibleKeys) {
            if (Array.isArray(data[key])) {
                return data[key];
            }
        }

        // If backend returns a raw array
        if (Array.isArray(data)) return data;

        console.warn("⚠ Unexpected Orders API Response:", data);
        return [];
    },
};
