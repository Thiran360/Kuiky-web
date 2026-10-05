import api from "./api";
import axios from "axios";
import { API_BASE_URL, FALLBACK_API_BASE_URL, ECOM_API_PATH, COMMON_HEADERS } from "./config";
import { API_ENDPOINTS } from "./endpoints";

const normalizeOrders = (data) => {
    if (!data) return [];
    if (data.message && typeof data.message === "string" && data.message.toLowerCase().includes("no order")) {
        return [];
    }
    const possibleKeys = [
        "orders", "order", "results", "data", "order_list",
        "orders_list", "user_orders",
    ];
    for (const key of possibleKeys) {
        if (Array.isArray(data[key])) {
            return data[key];
        }
    }
    if (Array.isArray(data)) return data;
    return [];
};

export const orderApi = {
    // Invalidate session cache when a new order is placed
    invalidateCache: (userId) => {
        try {
            sessionStorage.removeItem(`no_remote_orders_${userId}`);
            sessionStorage.removeItem("no_remote_orders_anon");
        } catch (e) {}
    },

    // GET: Fetch all orders for a user
    fetchOrders: async (userId) => {
        const params = {};
        if (userId && !isNaN(parseInt(userId))) {
            params.user_id = parseInt(userId);
        }

        const cacheKey = `no_remote_orders_${userId || "anon"}`;
        try {
            if (sessionStorage.getItem(cacheKey) === "true") {
                const localOrders = localStorage.getItem("ecom_local_orders") || localStorage.getItem("user_orders");
                if (localOrders) {
                    const parsedLocal = JSON.parse(localOrders);
                    if (Array.isArray(parsedLocal)) return parsedLocal;
                }
                return [];
            }
        } catch (e) {}

        // 1. Try Primary API (e.g. local backend on 127.0.0.1:8000)
        try {
            const response = await api.get(API_ENDPOINTS.USER_ORDERS, { params, timeout: 5000 });
            const orders = normalizeOrders(response.data);
            if (orders.length === 0) {
                try { sessionStorage.setItem(cacheKey, "true"); } catch (e) {}
            }
            return orders;
        } catch (error) {
            // Django returns 404 with {"message": "No orders found for this user"} when the user has 0 orders
            const isNoOrders404 =
                error.response?.status === 404 ||
                error.status === 404 ||
                (typeof error.response?.data?.message === "string" &&
                    error.response.data.message.toLowerCase().includes("no order"));

            if (isNoOrders404) {
                try { sessionStorage.setItem(cacheKey, "true"); } catch (e) {}
                // Check if user has local orders placed in current session
                try {
                    const localOrders = localStorage.getItem("ecom_local_orders") || localStorage.getItem("user_orders");
                    if (localOrders) {
                        const parsedLocal = JSON.parse(localOrders);
                        if (Array.isArray(parsedLocal) && parsedLocal.length > 0) return parsedLocal;
                    }
                } catch (e) {}
                return [];
            }

            console.warn("fetchOrders primary failed, checking fallback:", error.message);

            // 2. Try Fallback Production API
            if (FALLBACK_API_BASE_URL && FALLBACK_API_BASE_URL !== API_BASE_URL) {
                try {
                    const fallbackUrl = `${FALLBACK_API_BASE_URL}${ECOM_API_PATH}${API_ENDPOINTS.USER_ORDERS}`;
                    const fbRes = await axios.get(fallbackUrl, {
                        params,
                        headers: { ...COMMON_HEADERS },
                        timeout: 5000
                    });
                    return normalizeOrders(fbRes.data);
                } catch (fbErr) {
                    if (
                        fbErr.response?.status === 404 ||
                        (typeof fbErr.response?.data?.message === "string" &&
                            fbErr.response.data.message.toLowerCase().includes("no order"))
                    ) {
                        try { sessionStorage.setItem(cacheKey, "true"); } catch (e) {}
                        try {
                            const localOrders = localStorage.getItem("ecom_local_orders") || localStorage.getItem("user_orders");
                            if (localOrders) {
                                const parsedLocal = JSON.parse(localOrders);
                                if (Array.isArray(parsedLocal) && parsedLocal.length > 0) return parsedLocal;
                            }
                        } catch (e) {}
                        return [];
                    }
                    console.warn("fetchOrders fallback failed:", fbErr.message);
                }
            }
        }

        // 3. Check for any locally placed orders in localStorage
        try {
            const localOrders = localStorage.getItem("ecom_local_orders") || localStorage.getItem("user_orders");
            if (localOrders) {
                const parsedLocal = JSON.parse(localOrders);
                if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
                    return parsedLocal;
                }
            }
        } catch (e) {}

        // 4. Return clean empty list instead of throwing Network Error
        return [];
    },


    // ⭐️ POST to cancel a specific order ⭐️
    cancelOrder: async (orderId) => {
        try {
            const response = await api.post(
                API_ENDPOINTS.CANCEL_ORDER(orderId),
                {} // Empty body
            );
            return response.data;
        } catch (error) {
            console.error(`Failed to cancel order ${orderId}:`, error.response?.data || error);
            throw error.response?.data || new Error("Order cancellation failed.");
        }
    },

    // ⭐️ POST to add a product review ⭐️
    addReview: async ({ productId, review, comment }) => {
        try {
            const payload = {
                product_id: productId,
                rating: review,
                comment: comment
            };

            const response = await api.post(API_ENDPOINTS.REVIEWS_ADD, payload);
            return response.data;
        } catch (error) {
            console.error("Failed to add review:", error.response?.data || error);
            throw error.response?.data || new Error("Failed to add product review.");
        }
    },

    // GET: Fetch reviews for a product
    fetchReviewByProductId: async (productId) => {
        try {
            const response = await api.get(API_ENDPOINTS.PRODUCT_REVIEWS(productId));
            const data = response.data;

            if (Array.isArray(data) && data.length > 0) {
                return data[0];
            }
            return null;
        } catch (error) {
            console.error(`Failed to fetch review for product ${productId}:`, error);
            throw error;
        }
    },

    // ⭐️ PUT: Update an existing review ⭐️
    updateReview: async (reviewId, { rating, description }) => {
        try {
            const payload = {
                rating: rating,
                comment: description
            };

            const response = await api.put(
                API_ENDPOINTS.UPDATE_REVIEW(reviewId),
                payload
            );

            return Array.isArray(response.data) && response.data.length > 0
                ? response.data[0]
                : response.data;
        } catch (error) {
            console.error(`Failed to update review ${reviewId}:`, error.response?.data || error);
            throw error.response?.data || new Error("Failed to update product review.");
        }
    },

    // ⭐️ DELETE: Remove a product review ⭐️
    // DELETE /reviews/delete/<reviewId>/
    deleteReview: async (reviewId) => {
        try {
            const response = await api.delete(API_ENDPOINTS.DELETE_REVIEW(reviewId));
            return response.data;
        } catch (error) {
            console.error(`Failed to delete review ${reviewId}:`, error.response?.data || error);
            throw error.response?.data || new Error("Failed to delete product review.");
        }
    },

    // ⭐️ POST: Update order status (customer-facing — e.g. mark as received) ⭐️
    // POST /orders/<orderId>/update-status/
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await api.post(API_ENDPOINTS.UPDATE_ORDER_STATUS(orderId), { status });
            return response.data;
        } catch (error) {
            console.error(`Failed to update order ${orderId} status:`, error.response?.data || error);
            throw error.response?.data || new Error("Failed to update order status.");
        }
    },
};