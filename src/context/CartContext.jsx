// src/context/CartContext.jsx
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
} from "react";

// 1. IMPORT fetchSubCategories here
import { cartService, fetchSubCategories } from "../api/api";
import { useUser } from "./UserContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useUser();

    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // 2. NEW STATE for Subcategories
    const [subcategories, setSubcategories] = useState([]);

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

    // --- AUTHENTICATED API HANDLERS (CART) ---

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
            else if (Array.isArray(data.cart)) {
                items = data.cart;
            }
            else {
                console.warn("Unexpected cart API shape, using empty array:", data);
                items = [];
            }

            setCartItems(items);
            console.log("Cart loaded successfully:", items);
            return items;
        } catch (error) {
            console.error("Failed to fetch cart:", error);
            throw error;
        }
    };

    /** Clears the entire cart. */
    const clearCart = async () => {
        if (!isAuthenticated) {
            throw { message: "Authentication Required", status: 401 };
        }
        try {
            await cartService.clearCart?.();
            await refreshCart();
        } catch (error) {
            console.error("Failed to clear cart:", error);
            throw error;
        }
    };

    /** Adds/updates an item via the API. */
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
    const placeOrderFromCart = async (orderData) => {
        if (!isAuthenticated) {
            throw { message: "Authentication Required", status: 401 };
        }

        try {
            const response = await cartService.orderFromCart(orderData);
            await refreshCart();
            console.log("Order placed successfully:", response);
            return response;
        } catch (error) {
            console.error("Failed to place order:", error);
            throw error;
        }
    };

    const placeOrderDirectly = async (addressData) => {

        const userId = JSON.parse(localStorage.getItem("user_id"));
        if (!isAuthenticated) {
            throw { message: "Authentication Required", status: 401 };
        }

        // 1. Construct the 'items' array from the current cart state
        const itemsPayload = currentCart.items.map(cartItem => ({
            // Map cart item structure to the required product_variation and quantity
            product_variation: cartItem.product_variation_id, // Adjust field names as per your cart state
            quantity: cartItem.quantity
        }));

        // 2. Build the full payload structure
        const fullOrderPayload = {
            user_id: userId, // You should derive this from the authenticated user, not hardcode
            items: itemsPayload,
            address: addressData.address,
            pincode: addressData.pincode,
            latitude: addressData.latitude,
            longitude: addressData.longitude,
        };

        try {
            // Call the new service function with the full payload
            const response = await cartService.orderDirectly(fullOrderPayload);
            await refreshCart();
            console.log("Order placed successfully:", response);
            return response;
        } catch (error) {
            console.error("Failed to place direct order:", error);
            throw error;
        }
    };

    /** Updates item quantity by cart item ID */
    const updateItemQuantity = async (cartId, newQuantity) => {
        if (!isAuthenticated) {
            throw { message: "Authentication Required", status: 401 };
        }

        if (!cartId) {
            console.error(
                "updateItemQuantity failed: cartId is undefined. \nEnsure the item object passed from the component has a valid 'id' property (the cart item ID)."
            );
            throw new Error("Cannot update cart item: ID is missing.");
        }
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
            console.log(`Item with Cart ID ${cartId} removed successfully.`);
        } catch (error) {
            console.error("Failed to remove item from cart:", error);
            throw error;
        }
    };

    // --- CATALOG API HANDLER (SUBCATEGORIES) ---

    /** 3. Fetches subcategories with optional filtering. */
    const fetchCatalogSubcategories = async (categoryId, parentSubcategoryId) => {
        try {
            const data = await fetchSubCategories(categoryId, parentSubcategoryId);

            // Optionally update the general state if no filters are used
            if (categoryId === undefined && parentSubcategoryId === undefined) {
                setSubcategories(data || []);
            }

            return data;
        } catch (error) {
            console.error("Failed to fetch subcategories:", error);
            // Don't throw, just return empty array for component safety
            return [];
        }
    };


    // Initial cart load + re-fetch on auth change
    useEffect(() => {
        if (isAuthenticated) {
            refreshCart();
        } else {
            setCartItems([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    /** Finds item in cart (by product or variant id) */
    const findItemInCart = (productId, variantId = null) => {
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
            placeOrderFromCart,
            findItemInCart,
            totalItems,
            isCartOpen,
            openCart,
            closeCart,
            placeOrderDirectly,

            // 4. NEW: Export the subcategory state and fetcher
            subcategories,
            fetchCatalogSubcategories,
        }),
        [safeCartItems, totalItems, isCartOpen, subcategories]
    );

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};