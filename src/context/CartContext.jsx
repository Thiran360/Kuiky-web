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
    const { isAuthenticated, user, isLoading: isUserLoading } = useUser();

    // Local cart as fallback state
    const [cartItems, setCartItems] = useState(() => {
        try {
            const local = localStorage.getItem("localCart");
            return local ? JSON.parse(local) : [];
        } catch {
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
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

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem("localCart", JSON.stringify(safeCartItems));
    }, [safeCartItems]);

    // --- AUTHENTICATED API HANDLERS (CART) ---

    /** Fetches current user's cart from backend and updates state. */
    const refreshCart = async () => {
        if (!isAuthenticated) {
            setCartItems([]);
            return;
        }
        try {
            const data = await cartService.fetchCart();

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
                items = [];
            }

            setCartItems(items);
            return items;
        } catch (error) {
            console.warn("Backend cart API failed. Falling back to local cart.", error.message || error);
            // Don't modify cartItems if API fails to prevent overriding local changes.
            return safeCartItems;
        }
    };

    /** Clears the entire cart. */
    const clearCart = async () => {
        if (!isAuthenticated) {
            throw { message: "Authentication Required", status: 401 };
        }
        try {
            await cartService.clearCart?.();
        } catch (error) {
            // Ignore error
        }
        setCartItems([]);
    };

    /** Adds/updates an item via the API. */
    const addItemToCart = async (productVariantId, quantity = 1, productDetails = null) => {
        if (!isAuthenticated) {
            throw { message: "Authentication Required", status: 401 };
        }

        if (!productVariantId) {
            console.warn("addItemToCart: No productVariantId provided");
            return;
        }

        // Optimistic update
        const previousItems = [...safeCartItems];
        
        setCartItems(prev => {
            const existing = prev.find(item => 
                (item.product_variation_id === productVariantId || item.variation_id === productVariantId)
            );

            if (existing) {
                return prev.map(item =>
                    (item.product_variation_id === productVariantId || item.variation_id === productVariantId)
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                // Fallback for missing details - we try to build a minimal entry
                const selectedV = productDetails?.variations?.find(v => v.id === productVariantId);
                const actualOfferPrice = selectedV?.offer_price || selectedV?.price || productDetails?.offer_price || productDetails?.min_offer_price || productDetails?.price || 0;
                const actualPrice = selectedV?.price || productDetails?.price || productDetails?.min_price || 0;

                return [...prev, {
                    id: 'opt_' + Date.now(),
                    cart_item_id: 'opt_' + Date.now(),
                    product_id: productDetails?.id,
                    product_variation_id: productVariantId,
                    variation_id: productVariantId,
                    quantity: quantity,
                    offer_price: actualOfferPrice,
                    price: actualPrice,
                    product_name: productDetails?.name || "Product",
                    image: productDetails?.image || productDetails?.image_url || null,
                    variant_value: selectedV?.value || null
                }];
            }
        });

        try {
            await cartService.addToCart(productVariantId, quantity);
            // Refresh in background to get real IDs and server state
            refreshCart();
        } catch (error) {
            console.error("Backend cart addition failed, reverting state:", error.message || error);
            setCartItems(previousItems);
        }
    };

    /** Submits an order from the current cart. */
    const placeOrderFromCart = async (orderData) => {
        if (!isAuthenticated) throw { message: "Authentication Required", status: 401 };
        try {
            // BACKEND BUG WORKAROUND: The Django /order-from-cart/ endpoint crashes with the exact same 
            // 500 Error (Must be Customer instance) because it tries to evaluate the user's cart in the DB.
            // Since the cart items are preserved in safeCartItems locally, we assemble them natively and 
            // push them through the /place-order-directt/ endpoint instead, which bypasses the Cart DB entirely.
            
            const itemsPayload = safeCartItems.map(cartItem => ({
                product_variation: cartItem.product_variation_id || cartItem.variation_id,
                quantity: cartItem.quantity
            }));

            const userIdString = localStorage.getItem("user_id");
            const uid = userIdString ? parseInt(userIdString, 10) : (user?.id ? parseInt(user.id, 10) : null);

            const fullOrderPayload = {
                user_id: uid,
                items: itemsPayload,
                full_name: orderData.full_name || orderData.name || "",
                phone_number: orderData.phone_number || orderData.mobile || orderData.mobile_number || "",
                address: orderData.address || orderData.address_line_1 || "",
                address_line_1: orderData.address || orderData.address_line_1 || "",
                address_line_2: orderData.address_line_2 || "",
                pincode: orderData.pincode || orderData.postal_code || "",
                postal_code: orderData.pincode || orderData.postal_code || "",
                city: orderData.city || "",
                state: orderData.state || "",
                country: orderData.country || "India",
                latitude: orderData.latitude?.toString() || "0",
                longitude: orderData.longitude?.toString() || "0",
            };

            const response = await cartService.orderDirectly(fullOrderPayload);
            await clearCart();
            return response;
        } catch (error) {
            console.error("Failed to place order from cart (via direct bridge):", error);
            throw error;
        }
    };

    const placeOrderDirectly = async (addressData) => {
        if (!isAuthenticated) throw { message: "Authentication Required", status: 401 };

        // Construct items from local cart
        const itemsPayload = safeCartItems.map(cartItem => ({
            product_variation: cartItem.product_variation_id || cartItem.variation_id,
            quantity: cartItem.quantity
        }));

        const userIdString = localStorage.getItem("user_id");
        const uid = userIdString ? parseInt(userIdString, 10) : (user?.id ? parseInt(user.id, 10) : null);

        const fullOrderPayload = {
            user_id: uid,
            items: itemsPayload,
            full_name: addressData.full_name || addressData.name || "",
            phone_number: addressData.phone_number || addressData.mobile || addressData.mobile_number || "",
            address: addressData.address || addressData.address_line_1 || "",
            address_line_1: addressData.address || addressData.address_line_1 || "",
            address_line_2: addressData.address_line_2 || "",
            pincode: addressData.pincode || addressData.postal_code || "",
            postal_code: addressData.pincode || addressData.postal_code || "",
            city: addressData.city || "",
            state: addressData.state || "",
            country: addressData.country || "India",
            latitude: addressData.latitude?.toString() || "0",
            longitude: addressData.longitude?.toString() || "0",
        };

        try {
            const response = await cartService.orderDirectly(fullOrderPayload);
            await clearCart();
            return response;
        } catch (error) {
            console.error("Failed to place direct order:", error);
            throw error;
        }
    };

    /** Updates item quantity by cart item ID */
    const updateItemQuantity = async (cartId, newQuantity) => {
        if (!isAuthenticated) throw { message: "Authentication Required", status: 401 };
        
        // Optimistic update
        const previousItems = [...safeCartItems];
        setCartItems(prev => prev.map(item => (item.id === cartId || item.cart_item_id === cartId) ? { ...item, quantity: newQuantity } : item));

        try {
            if (String(cartId).startsWith('local_') || String(cartId).startsWith('opt_')) return;
            await cartService.updateToCart(cartId, newQuantity);
        } catch (error) {
            console.warn("Cart update failed, reverting:", error);
            setCartItems(previousItems);
        }
    };

    /** Removes item from cart by cart item ID */
    const removeFromCart = async (cartId) => {
        if (!isAuthenticated) throw { message: "Authentication Required", status: 401 };

        // Optimistic update
        const previousItems = [...safeCartItems];
        setCartItems(prev => prev.filter(item => item.id !== cartId && item.cart_item_id !== cartId));

        try {
            if (String(cartId).startsWith('local_') || String(cartId).startsWith('opt_')) return;
            await cartService.deleteCartItem(cartId);
        } catch (error) {
            console.warn("Cart removal failed, reverting:", error);
            setCartItems(previousItems);
        }
    };

    // --- CATALOG API HANDLER (SUBCATEGORIES) ---

    const fetchCatalogSubcategories = async (categoryId, parentSubcategoryId) => {
        try {
            const data = await fetchSubCategories(categoryId, parentSubcategoryId);
            if (categoryId === undefined && parentSubcategoryId === undefined) {
                setSubcategories(data || []);
            }
            return data;
        } catch (error) {
            return [];
        }
    };

    // Initial cart load + re-fetch on auth change
    useEffect(() => {
        if (!isUserLoading && isAuthenticated) {
            refreshCart();
        } else if (!isUserLoading && !isAuthenticated) {
            setCartItems([]);
            localStorage.removeItem("localCart");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, isUserLoading]);

    const findItemInCart = (productId, variantId = null) => {
        return safeCartItems.find(
            (item) => {
                // If variantId is provided, MUST match both product AND variant
                if (variantId) {
                    return (item.product_id === productId || item.id === productId) &&
                        (item.product_variation_id === variantId || item.variation_id === variantId);
                }
                // If no variantId, just match the product
                return item.product_id === productId || item.id === productId;
            }
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
            cartItemCount: totalItems,
            isCartOpen,
            openCart,
            closeCart,
            placeOrderDirectly,

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