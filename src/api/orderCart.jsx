// src/api/orderApi.js
import axios from "axios";

// Assuming BASE_URL_ORDER is your base URL up to the root of the API

const BASE_URL_ORDER = "https://snappier-reapply-kieth.ngrok-free.dev/ecomapp";


const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return { headers: { 
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}` } };
};

export const orderApi = {
    // GET: Fetch all orders for a user
    fetchOrders: async () => {
        const userId = JSON.parse(localStorage.getItem("user_id"));
        try {
            const response = await axios.get(
                `${BASE_URL_ORDER}/user-orders/?user_id=${userId}`,
                getAuthHeader()
            );

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
            throw error; // Re-throw for context/component handling
        }
    },

    // ⭐️ EXISTING: POST to cancel a specific order ⭐️
    /**
     * Sends a request to cancel a specific order.
     * @param {number} orderId The ID of the order to cancel.
     */
    cancelOrder: async (orderId) => {
        try {
            // NOTE: Using POST for an action endpoint is common. 
            const response = await axios.post(
                `${BASE_URL_ORDER}/orders/${orderId}/cancel/`,
                {}, // Empty body, as cancellation often doesn't require payload
                getAuthHeader()
            );
            return response.data; // Should return success message or updated order status
        } catch (error) {
            console.error(`Failed to cancel order ${orderId}:`, error.response?.data || error);
            // Throw error to be caught by the component/hook using this function
            throw error.response?.data || new Error("Order cancellation failed.");
        }
    },

    // ⭐️ NEW: POST to add a product review ⭐️
    /**
     * Sends a request to add a new review for a product.
     * Endpoint: reviews/add/
     * Payload: { productId, review, command }
     * @param {Object} reviewData
     * @param {number} reviewData.productId The ID of the product being reviewed.
     * @param {string} reviewData.review The text content of the review.
     * @param {string} reviewData.command A command string (e.g., 'ADD_REVIEW').
     */
    addReview: async ({ productId, review, comment }) => {
        try {
            const payload = {
                product_id: productId,
                rating: review,
                comment: comment
            };

            const response = await axios.post(
                `${BASE_URL_ORDER}/reviews/add/`,
                payload,
                getAuthHeader()
            );


            return response.data;
        } catch (error) {
            console.error("Failed to add review:", error.response?.data || error);
            // Throw error for context/component handling
            throw error.response?.data || new Error("Failed to add product review.");
        }
    },

    fetchReviewByProductId: async (productId) => {
        try {
            const response = await axios.get(
                `${BASE_URL_ORDER}/reviews/${productId}/`,
                getAuthHeader()
            );

            const data = response.data;


            // Assuming the backend returns an array of reviews (usually just one for the current user/product combo)
            if (Array.isArray(data) && data.length > 0) {
                return data[0]; // Return the existing review object
            }
            return null; // No review found
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

            const response = await axios.put(
                `${BASE_URL_ORDER}/reviews/update/${reviewId}/`,
                payload,
                getAuthHeader()
            );

            return Array.isArray(response.data) && response.data.length > 0
                ? response.data[0]
                : response.data;
        } catch (error) {
            console.error(`Failed to update review ${reviewId}:`, error.response?.data || error);
            throw error.response?.data || new Error("Failed to update product review.");
        }
    },
};