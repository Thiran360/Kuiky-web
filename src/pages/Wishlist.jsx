// src/pages/Wishlist.jsx

import React, { useEffect, useState, useCallback } from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../api/config";
import { Trash2, ShoppingCart, Check } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header"; 
import "./Wishlist.css";
import { wishlistService } from "../api/wishlistService";

const Wishlist = () => {
    // --- HOOKS ---
    const { wishlist, loading, loadWishlist, removeItemLocally } = useWishlist();
    // Import findItemInCart to check persistent status
    const { addItemToCart, refreshCart, findItemInCart } = useCart(); 
    const navigate = useNavigate();

    // REMOVED: [addedToCart, setAddedToCart] state is no longer needed.
    
    useEffect(() => {
        loadWishlist();
    }, [loadWishlist]);

    const getProduct = (item) => item.product || item;

    // --- HELPER FUNCTIONS ---
    
    // Function to reliably get the product ID used for local operations (Wishlist context)
    const getProductId = (item) => {
        const p = getProduct(item);
        return (
            item?.product_id ||
            p?.product_id ||
            p?.id ||
            item?.product?.id ||
            null
        );
    };

    // Function to reliably get the Variant ID to use for Cart operations
    const getVariantIdForCart = (productId, product) => {
        // Use the default/first available variant ID for the cart operation
        return (
            product?.default_variant_id ||
            product?.variations?.[0]?.id ||
            productId // Fallback to product ID if no variant ID found
        );
    };

    // REMOVE
    const handleRemove = async (e, productId) => {
        if (e) e.stopPropagation();
        if (!productId) return;

        try {
            await wishlistService.removeFromWishlist(productId);
            removeItemLocally(productId);
        } catch (err) {
            console.error("Failed to remove from wishlist:", err);
            alert("Failed to remove item from wishlist. Please try again.");
        }
    };

    // ADD → CART (Logic simplified to rely on context's persistence)
    const handleMoveToCart = async (e, productId, product) => {
        e.stopPropagation();
        if (!productId) return;

        try {
            const variantId = getVariantIdForCart(productId, product);

            // Check if already in cart (redundant but safe check)
            if (findItemInCart(variantId)) {
                // If already present, maybe just refresh and exit
                await refreshCart();
                return;
            }

            await addItemToCart(variantId, 1);
            // refreshCart is called inside addItemToCart, but calling it here ensures UI update if the context relies on it externally.
            // await refreshCart(); 

            // REMOVED: setAddedToCart state update
            
        } catch (err) {
            console.error("Move to cart failed:", err);
            alert("Failed to move item to cart.");
        }
    };

    return (
        <div className="wishlist-page">
            <div className="wishlist-container">
                <h1 className="wishlist-title">My Wishlist ({wishlist.length} items)</h1>

                {loading && <div className="wishlist-loading">Loading...</div>}

                {!loading && wishlist.length === 0 && (
                    <div className="wishlist-empty">
                        <p className="empty-message">You haven't saved any items yet.</p>
                        <button className="wishlist-empty-btn" onClick={() => navigate("/")}>
                            Start Shopping Now
                        </button>
                    </div>
                )}

                {!loading && wishlist.length > 0 && (
                    <div className="wishlist-grid">
                        {wishlist.map((item) => {
                            const product = getProduct(item);
                            const productId = getProductId(item);

                            if (!productId) return null;

                            // --- PERSISTENCE FIX ---
                            const variantIdForCart = getVariantIdForCart(productId, product);
                            const isProductInCart = !!findItemInCart(productId, variantIdForCart); // Check cart state
                            // -----------------------

                            const name =
                                product?.name || product?.product_name || "Unnamed Product";
                            const price =
                                product?.offer_price ||
                                product?.selling_price ||
                                product?.price ||
                                0;
                            const originalPrice = product?.price || 0; 
                            const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                            
                            const image =
                                product?.image ||
                                product?.image_url ||
                                product?.product_image;

                            return (
                                <div key={productId} className="wishlist-card">
                                    <div className="wishlist-image-wrapper">
                                        <img
                                            src={getImageUrl(image)}
                                            alt={name}
                                            className="wishlist-image"
                                            onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=No+Image"; }}
                                        />
                                        {discount > 0 && (
                                            <div className="wishlist-discount-badge">{discount}% OFF</div>
                                        )}
                                    </div>

                                    <div className="wishlist-info">
                                        <h2 className="wishlist-product-name">{name}</h2>
                                        
                                        <div className="wishlist-price-row">
                                            <span className="wishlist-price">
                                                ₹{Number(price).toFixed(0)}
                                            </span>
                                            {originalPrice > price && (
                                                <span className="wishlist-original-price">
                                                    ₹{Number(originalPrice).toFixed(0)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="wishlist-actions">
                                            {isProductInCart ? ( // Use persistent status
                                                <button
                                                    className="wishlist-move-to-cart added-state"
                                                    disabled
                                                >
                                                    <Check size={18} />
                                                    <span>Added</span>
                                                </button>
                                            ) : (
                                                <button
                                                    className="wishlist-move-to-cart"
                                                    onClick={(e) =>
                                                        handleMoveToCart(e, productId, product)
                                                    }
                                                >
                                                    <ShoppingCart size={18} />
                                                    <span>Move to Cart</span>
                                                </button>
                                            )}

                                            <button
                                                className="wishlist-remove-btn"
                                                onClick={(e) => handleRemove(e, productId)}
                                            >
                                                <Trash2 size={18} />
                                                <span>Remove</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;