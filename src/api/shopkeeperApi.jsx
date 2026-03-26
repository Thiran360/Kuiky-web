// src/api/shopkeeperApi.js
// ================================================================
// 🏪 SHOPKEEPER / ADMIN API SERVICE
// All endpoints below are SHOPKEEPER/ADMIN only.
// They require the logged-in user to be a shopkeeper, not a customer.
// ================================================================
import api from "./api";

export const shopkeeperApi = {

    // ============================================================
    // 👤 SHOPKEEPER PROFILE
    // ============================================================

    // GET: List all shopkeeper profiles
    // GET /profiles/
    listProfiles: async () => {
        try {
            const res = await api.get("/profiles/");
            return res.data;
        } catch (error) {
            console.error("Failed to fetch shopkeeper profiles:", error);
            throw error.response?.data || new Error("Failed to fetch profiles.");
        }
    },

    // POST: Create a new shopkeeper profile
    // POST /profiles/create/
    createProfile: async (profileData) => {
        try {
            const res = await api.post("/profiles/create/", profileData);
            return res.data;
        } catch (error) {
            console.error("Failed to create shopkeeper profile:", error);
            throw error.response?.data || new Error("Failed to create profile.");
        }
    },

    // GET/PUT: Get or update a specific shopkeeper profile by ID
    // GET/PUT /profiles/<pk>/
    getOrUpdateProfile: async (pk, data = null) => {
        try {
            const res = data
                ? await api.put(`/profiles/${pk}/`, data)
                : await api.get(`/profiles/${pk}/`);
            return res.data;
        } catch (error) {
            console.error(`Failed to get/update profile ${pk}:`, error);
            throw error.response?.data || new Error("Failed to get/update profile.");
        }
    },

    // ============================================================
    // 📦 PRODUCT MANAGEMENT (Shopkeeper)
    // ============================================================

    // POST: Upload images for a product
    // POST /products/<product_id>/upload-images/
    uploadProductImages: async (productId, formData) => {
        try {
            const res = await api.post(`/products/${productId}/upload-images/`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        } catch (error) {
            console.error(`Failed to upload images for product ${productId}:`, error);
            throw error.response?.data || new Error("Failed to upload product images.");
        }
    },

    // GET: Fetch images for a product
    // GET /products/<product_id>/images/
    getProductImages: async (productId) => {
        try {
            const res = await api.get(`/products/${productId}/images/`);
            return res.data;
        } catch (error) {
            console.error(`Failed to fetch images for product ${productId}:`, error);
            throw error.response?.data || new Error("Failed to fetch product images.");
        }
    },

    // DELETE: Delete a specific product image
    // DELETE /products/images/<image_id>/delete/
    deleteProductImage: async (imageId) => {
        try {
            const res = await api.delete(`/products/images/${imageId}/delete/`);
            return res.data;
        } catch (error) {
            console.error(`Failed to delete image ${imageId}:`, error);
            throw error.response?.data || new Error("Failed to delete product image.");
        }
    },

    // PUT: Update a product variation
    // PUT /products/variations/<variation_id>/
    updateProductVariation: async (variationId, data) => {
        try {
            const res = await api.put(`/products/variations/${variationId}/`, data);
            return res.data;
        } catch (error) {
            console.error(`Failed to update variation ${variationId}:`, error);
            throw error.response?.data || new Error("Failed to update product variation.");
        }
    },

    // POST: Toggle product active/inactive status
    // POST /update-is-active/
    updateIsActive: async (productId, isActive) => {
        try {
            const res = await api.post("/update-is-active/", {
                product_id: productId,
                is_active: isActive,
            });
            return res.data;
        } catch (error) {
            console.error("Failed to update product active status:", error);
            throw error.response?.data || new Error("Failed to update product status.");
        }
    },

    // PUT: Update product variation (alternate endpoint)
    // PUT /product-variation/<variation_id>/update/
    updateProductVariationAlt: async (variationId, data) => {
        try {
            const res = await api.put(`/product-variation/${variationId}/update/`, data);
            return res.data;
        } catch (error) {
            console.error(`Failed to update variation (alt) ${variationId}:`, error);
            throw error.response?.data || new Error("Failed to update product variation.");
        }
    },

    // ============================================================
    // 📋 ORDER MANAGEMENT (Shopkeeper)
    // ============================================================

    // GET: Fetch all orders for the shopkeeper's store
    // GET /get-orders-by-shopkeeper/
    getOrdersByShopkeeper: async () => {
        try {
            const res = await api.get("/get-orders-by-shopkeeper/");
            return Array.isArray(res.data) ? res.data : (res.data?.results || []);
        } catch (error) {
            console.error("Failed to fetch shopkeeper orders:", error);
            throw error.response?.data || new Error("Failed to fetch orders.");
        }
    },

    // GET: Fetch all individual order items across all orders
    // GET /get_all_order_items/
    getAllOrderItems: async () => {
        try {
            const res = await api.get("/get_all_order_items/");
            return Array.isArray(res.data) ? res.data : (res.data?.results || []);
        } catch (error) {
            console.error("Failed to fetch all order items:", error);
            throw error.response?.data || new Error("Failed to fetch order items.");
        }
    },

    // POST: Accept an order (shopkeeper confirms)
    // POST /orders/<orderId>/acceptt/
    acceptOrder: async (orderId) => {
        try {
            const res = await api.post(`/orders/${orderId}/acceptt/`, {});
            return res.data;
        } catch (error) {
            console.error(`Failed to accept order ${orderId}:`, error);
            throw error.response?.data || new Error("Failed to accept order.");
        }
    },

    // POST: Update the status of an order (shopkeeper side)
    // POST /update-order-status/<orderId>/
    updateOrderStatus: async (orderId, status) => {
        try {
            const res = await api.post(`/update-order-status/${orderId}/`, { status });
            return res.data;
        } catch (error) {
            console.error(`Failed to update order status for ${orderId}:`, error);
            throw error.response?.data || new Error("Failed to update order status.");
        }
    },
};

export default shopkeeperApi;
