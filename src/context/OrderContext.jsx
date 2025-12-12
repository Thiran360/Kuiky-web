// src/context/OrderContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// ⭐️ Import the API module
import { orderApi } from '../api/orderCart'; 

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

/**
 * Provides order state and fetching logic.
 * Requires the userId to be passed in from the parent component (e.g., from Auth/Profile Context).
 */
export const OrderProvider = ({ children, userId }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            // Stop execution if no user ID is available
            return; 
        }
        
        setLoading(true);
        setError(null);
        try {
            const fetchedOrders = await orderApi.fetchOrders(userId); 
            setOrders(fetchedOrders);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            // Improved error message for the user
            setError("Failed to load your order history. Please try again.");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // ⭐️ EXISTING: Function to cancel an order ⭐️
    const cancelUserOrder = async (orderId) => {
        if (!orderId) {
            return { success: false, message: "Invalid Order ID provided." };
        }

        try {
            // Call the API function
            const response = await orderApi.cancelOrder(orderId);

            // Re-fetch the order list to refresh the UI and confirm the status change.
            await fetchOrders(); 
            
            return { 
                success: true, 
                message: response.message || `Order ${orderId} successfully cancelled.` 
            };
        } catch (err) {
            console.error(`Failed to cancel order ${orderId}:`, err);
            // Extract a user-friendly error message
            const errorMessage = err?.message || err?.detail || "Could not cancel order. Please check the order status.";
            return { 
                success: false, 
                message: errorMessage 
            };
        }
    };
    
    // ⭐️ NEW: Function to add a product review ⭐️
    /**
     * Adds a product review using the API.
     * @param {Object} reviewData - { productId, review, command }
     * @returns {Promise<{success: boolean, message: string}>}
     */
    const addProductReview = async (reviewData) => {
        try {
            // Call the API function with the review payload
            const response = await orderApi.addReview(reviewData); 
            
            return { 
                success: true, 
                message: response.message || "Review added successfully!" 
            };
        } catch (err) {
            console.error("Failed to add review:", err);
            // Extract a user-friendly error message
            const errorMessage = err?.response?.data?.detail || err?.message || "Could not submit review. Please try again.";
            return { 
                success: false, 
                message: errorMessage 
            };
        }
    };

    const updateProductReview = async (reviewId, { rating, description }) => {
        try {
            const response = await orderApi.updateReview(reviewId, { rating, description });
            
            return { 
                success: true, 
                message: "Review updated successfully!",
                review: response 
            };
        } catch (err) {
            console.error(`Failed to update review ${reviewId}:`, err);
            const errorMessage = err?.response?.data?.detail || err?.message || "Could not update review. Please try again.";
            return { 
                success: false, 
                message: errorMessage 
            };
        }
    };
    
    // ⭐️ NEW: Function to fetch a specific product review for the user ⭐️
    /**
     * Fetches the current user's review data for a given product ID.
     * @param {number} productId 
     * @returns {Object | null} The review object or null if none exists.
     */
    const fetchProductReview = async (productId) => {
        try {
            const review = await orderApi.fetchReviewByProductId(productId);
            return review; 
        } catch (err) {
            // Log the error but return null/undefined so the UI component can handle the missing review gracefully
            console.error(`Error fetching review for product ${productId}:`, err);
            return null; 
        }
    };

    // Fetch orders on component mount or when userId changes
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const contextValue = {
        orders,
        loading,
        error,
        fetchOrders,
        // ⭐️ Expose the existing cancellation function
        cancelUserOrder, 
        // ⭐️ Expose the new review function
        addProductReview,
        fetchProductReview,
        updateProductReview
    };

    return (
        <OrderContext.Provider value={contextValue}>
            {children}
        </OrderContext.Provider>
    );
};