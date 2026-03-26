// src/context/OrderContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';
import { orderApi } from '../api/orderCart'; 

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

/**
 * Provides order state and fetching logic.
 */
export const OrderProvider = ({ children }) => {
    const { user, isAuthenticated } = useUser();
    const userId = user?.id || null;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false);
            setOrders([]);
            return; 
        }
        
        setLoading(true);
        setError(null);
        try {
            const fetchedOrders = await orderApi.fetchOrders(userId); 
            setOrders(fetchedOrders);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setError(err.message || "Failed to load your order history. Please try again.");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [userId, isAuthenticated]); // Dependency on userId is correct here

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
            const response = await orderApi.updateReview(reviewId, { rating, comment: description });
            return { 
                success: true, 
                message: "Review updated successfully!",
                review: response 
            };
        } catch (err) {
            console.error(`Failed to update review ${reviewId}:`, err);
            return { 
                success: false, 
                message: err.message || "Could not update review. Please try again."
            };
        }
    };

    // ⭐️ DELETE: Remove a product review
    // DELETE /reviews/delete/<reviewId>/
    const deleteProductReview = async (reviewId) => {
        try {
            await orderApi.deleteReview(reviewId);
            return { success: true, message: "Review deleted successfully!" };
        } catch (err) {
            console.error(`Failed to delete review ${reviewId}:`, err);
            return {
                success: false,
                message: err.message || "Could not delete review. Please try again."
            };
        }
    };

    // ⭐️ POST: Update order status (e.g. customer marks as received)
    // POST /orders/<orderId>/update-status/
    const updateUserOrderStatus = async (orderId, status) => {
        try {
            const response = await orderApi.updateOrderStatus(orderId, status);
            await fetchOrders(); // Refresh orders list
            return {
                success: true,
                message: response.message || `Order status updated to '${status}'.`
            };
        } catch (err) {
            console.error(`Failed to update order ${orderId} status:`, err);
            return {
                success: false,
                message: err.message || "Could not update order status. Please try again."
            };
        }
    };

    // ⭐️ Function to fetch a specific product review for the user ⭐️
    const fetchProductReview = async (productId) => {
        try {
            const review = await orderApi.fetchReviewByProductId(productId);
            return review; 
        } catch (err) {
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
        deleteProductReview,      // DELETE /reviews/delete/<id>/
        updateUserOrderStatus,    // POST /orders/<id>/update-status/
    };

    return (
        <OrderContext.Provider value={contextValue}>
            {children}
        </OrderContext.Provider>
    );
};