// src/context/CartContext.jsx
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
} from "react";

import { cartService } from "../api/api";
import { useUser } from "./UserContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useUser();

    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // 🔒 Always treat cartItems as an array
    const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

    const totalItems = useMemo(
        () =>
            safeCartItems.reduce(
                (sum, item) => sum + (item.quantity || 0),
                0
            ),
        [safeCartItems]
    );

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    // --- AUTHENTICATED API HANDLERS ---

    /** Fetches current user's cart from backend and updates state. */
    const refreshCart = async () => {
        if (!isAuthenticated) {
            setCartItems([]);
            return;
        }
        try {
            const data = await cartService.fetchCart();

            // 🔍 Normalize the response to ALWAYS be an array
            let items = [];
            if (Array.isArray(data)) {
                items = data;
            } else if (Array.isArray(data.items)) {
                items = data.items;
            } else if (Array.isArray(data.results)) {
                items = data.results;
            }
            // ⭐ ADDED CHECK: Handle the API response structure where items are inside 'cart'
            else if (Array.isArray(data.cart)) {
                items = data.cart;
            }
            // The final fallback if the cart array structure is completely unexpected
            else {
                console.warn("Unexpected cart API shape, using empty array:", data);
                items = [];
            }

            setCartItems(items);
            console.log("Cart loaded successfully:", items);
            return items;
        } catch (error) {
            console.error("Failed to fetch cart:", error);
            // Do NOT change cartItems here, just propagate the error
            throw error;
        }
    };

    /** Clears the entire cart. */
    const clearCart = async () => {
        if (!isAuthenticated) {
            throw { message: "Authentication Required", status: 401 };
        }
        try {
            await cartService.clearCart?.(); // only if you implemented clearCart in api
            await refreshCart();
        } catch (error) {
            console.error("Failed to clear cart:", error);
            throw error;
        }
    };

    /** Adds/updates/removes an item via the API. */
    const addItemToCart = async (productVariantId, quantity = 1) => {
        if (!isAuthenticated) {
            throw { message: "Authentication Required", status: 401 };
        }

        try {
            await cartService.addToCart(productVariantId, quantity);
            await refreshCart();
            console.log(
                `Item ID ${productVariantId} updated to quantity ${quantity} successfully.`
            );
        } catch (error) {
            console.error("Failed to add/update item in cart:", error);
            throw error;
        }
    };

    /** Submits an order from the current cart. */
    // ⭐️ NEW FUNCTION: placeOrderFromCart
    const placeOrderFromCart = async (orderData) => {
        if (!isAuthenticated) {
            throw { message: "Authentication Required", status: 401 };
        }

        try {
            // Call the new API service function
            const response = await cartService.orderFromCart(orderData);

            // The API typically clears the cart on successful order, so refresh the cart state
            await refreshCart();

            console.log("Order placed successfully:", response);
            return response;
        } catch (error) {
            console.error("Failed to place order:", error);
            throw error;
        }
    };


    // Initial load + re-fetch on auth change
    useEffect(() => {
        if (isAuthenticated) {
            refreshCart();
        } else {
            setCartItems([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    /** Updates item quantity by variant ID */
    // const updateItemQuantity = async (cartId, newQuantity) => {
    //  return updateToCart(cartId, newQuantity);
    // };

    /** Updates item quantity by cart item ID */
    const updateItemQuantity = async (cartId, newQuantity) => {
        if (!isAuthenticated) {
            throw { message: "Authentication Required", status: 401 };
        }

        // ⭐️ FIX 1: DEFENSIVE CHECK 
        if (!cartId) {
            console.error(
                "updateItemQuantity failed: cartId is undefined. \nEnsure the item object passed from the component has a valid 'id' property (the cart item ID)."
            );
            throw new Error("Cannot update cart item: ID is missing.");
        }
        // Optional check for quantity
        if (typeof newQuantity !== 'number' || newQuantity < 1) {
            console.error("updateItemQuantity failed: Invalid quantity provided.", { cartId, newQuantity });
            throw new Error("Cannot update cart item: Invalid quantity.");
        }

        try {
            await cartService.updateToCart(cartId, newQuantity);
            await refreshCart();
            console.log(
                `Item ID ${cartId} updated to quantity ${newQuantity} successfully.`
            );
        } catch (error) {
            console.error("Failed to add/update item in cart:", error);
            throw error;
        }
    };

    /** Removes item from cart by cart item ID */
    const removeFromCart = async (cartId) => {
        if (!isAuthenticated) {
            throw { message: "Authentication Required", status: 401 };
        }

        try {
            await cartService.deleteCartItem(cartId);
            await refreshCart();
            // ⭐️ FIXED: Changed console.log to remove reference to undefined 'quantity' variable
            console.log(`Item with Cart ID ${cartId} removed successfully.`);
        } catch (error) {
            console.error("Failed to remove item from cart:", error);
            throw error;
        }
    };



    /** Finds item in cart (by product or variant id) */
    const findItemInCart = (productId, variantId = null) => {
        // FIX: Also check for the 'variation_id' property used by your API response
        return safeCartItems.find(
            (item) =>
                item.variation_id === productId ||
                item.product_variant_id === productId ||
                item.variation_id === variantId ||
                item.product_variant_id === variantId
        );
    };

    const contextValue = useMemo(
        () => ({
            cartItems: safeCartItems,
            addItemToCart,
            updateItemQuantity,
            removeFromCart,
            refreshCart,
            clearCart,
            // ⭐️ NEW: Export the new function
            placeOrderFromCart,
            findItemInCart,
            totalItems,
            isCartOpen,
            openCart,
            closeCart,
        }),
        [safeCartItems, totalItems, isCartOpen]
    );

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};