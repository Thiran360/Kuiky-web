import api from "./api";
import { API_ENDPOINTS } from "./endpoints";

export const orderApi = {
    // GET: Fetch all orders for a user
    fetchOrders: async (userId) => {
        try {
            const params = {};
            if (userId && !isNaN(parseInt(userId))) {
                params.user_id = parseInt(userId);
            }
            
            const response = await api.get(API_ENDPOINTS.USER_ORDERS, { params });

            const data = response.data;

            // ⭐ UNIVERSAL NORMALIZER (supports all backend variations)
            const possibleKeys = [
                "orders", "order", "results", "data", "order_list",
                "orders_list", "user_orders",
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
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            throw error;
        }
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