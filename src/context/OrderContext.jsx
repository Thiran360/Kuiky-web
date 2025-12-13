// src/context/OrderContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// ⭐️ Ensure the import path is correct: orderApi should be imported from its location
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

    // ⭐️ FIX: Removed 'userId' argument from the function, relying on the closure variable
    // and correctly using 'userId' from the provider's props.
    const fetchOrders = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            // Stop execution if no user ID is available
            return; 
        }
        
        setLoading(true);
        setError(null);
        try {
            // Use the userId from the provider's scope
            const fetchedOrders = await orderApi.fetchOrders(userId); 
            setOrders(fetchedOrders);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            // Improved error message for the user
            // Use err.message as the API layer now throws a proper Error object
            setError(err.message || "Failed to load your order history. Please try again.");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [userId]); // Dependency on userId is correct here

    // ⭐️ EXISTING: Function to cancel an order ⭐️
    const cancelUserOrder = async (orderId) => {
        if (!orderId) {
            return { success: false, message: "Invalid Order ID provided." };
        }

        try {
            // Call the API function
            const response = await orderApi.cancelOrder(orderId);

            // Re-fetch the order list to refresh the UI and confirm the status change.
            // Call fetchOrders without an argument
            await fetchOrders(); 
            
            return { 
                success: true, 
                message: response.message || `Order ${orderId} successfully cancelled.` 
            };
        } catch (err) {
            console.error(`Failed to cancel order ${orderId}:`, err);
            // Extract a user-friendly error message
            const errorMessage = err.message || "Could not cancel order. Please check the order status.";
            return { 
                success: false, 
                message: errorMessage 
            };
        }
    };
    
    // ⭐️ Function to add a product review ⭐️
    const addProductReview = async (reviewData) => {
        try {
            // Call the API function with the review payload
            const response = await orderApi.addReview(reviewData); 
            
            return { 
                success: true, 
                message: response.message || "Review added successfully!",
                review: response // return the review object for component use
            };
        } catch (err) {
            console.error("Failed to add review:", err);
            // Extract a user-friendly error message
            const errorMessage = err.message || "Could not submit review. Please try again.";
            return { 
                success: false, 
                message: errorMessage 
            };
        }
    };

    const updateProductReview = async (reviewId, { rating, description }) => {
        try {
            // Note: The API function expects an object { rating, comment: description }
            const response = await orderApi.updateReview(reviewId, { rating, comment: description });
            
            return { 
                success: true, 
                message: "Review updated successfully!",
                review: response 
            };
        } catch (err) {
            console.error(`Failed to update review ${reviewId}:`, err);
            const errorMessage = err.message || "Could not update review. Please try again.";
            return { 
                success: false, 
                message: errorMessage 
            };
        }
    };
    
    // ⭐️ Function to fetch a specific product review for the user ⭐️
    const fetchProductReview = async (productId) => {
        try {
            const review = await orderApi.fetchReviewByProductId(productId);
            return review; 
        } catch (err) {
            // A 404 (no review found) is typically handled by the API returning null.
            // If it's a true network/server error, we log it and return null for graceful fallback.
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
        cancelUserOrder, 
        addProductReview,
        fetchProductReview,
        updateProductReview,
        // Optional: deleteReview can be added here if you want that functionality
    };

    return (
        <OrderContext.Provider value={contextValue}>
            {children}
        </OrderContext.Provider>
    );
};