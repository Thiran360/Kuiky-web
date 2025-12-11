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

  // Fetch orders on component mount or when userId changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const contextValue = {
    orders,
    loading,
    error,
    fetchOrders,
  };

  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
};