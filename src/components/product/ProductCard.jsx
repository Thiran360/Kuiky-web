// src/components/ProductCard/ProductCard.js
// Removed: import {fetchSubCategories} from "../../api/api";
// This is not needed here

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Heart, ShoppingCart, Zap, Check } from "lucide-react"; // Import Check icon
import { getImageUrl } from "../../api/config";
import "./ProductCard.css";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";

const ProductCard = ({ product }) => {
    // --- HOOKS ---
    const { addItemToCart, findItemInCart } = useCart();
    const navigate = useNavigate();
    const { isProductWishlisted, toggleWishlist } = useWishlist();

    const hasVariations = product.variations && product.variations.length > 0;

    const [selectedVariant, setSelectedVariant] = useState(
        hasVariations ? product.variations[0] : null
    );
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false); 
    const [error, setError] = useState(null);
    
    // NOTE: Removed isAddedOnce state as the status will be derived from the cart.

    // Update selected variant if product changes
    useEffect(() => {
        setSelectedVariant(hasVariations ? product.variations[0] : null);
    }, [product, hasVariations]);

    const getVariantId = useCallback(() => selectedVariant?.id || null, [selectedVariant]);

    // --- CART STATUS & PRICE CALCULATION ---
    
    // 1. Calculate persistent cart status based on selected variant
    const isInCart = useMemo(() => {
        const productVariantId = getVariantId();
        // Check if the currently selected variant exists in the cart with quantity > 0
        return !!findItemInCart(product.id, productVariantId);
    }, [product.id, getVariantId, findItemInCart]);

    // 2. Derive wishlisted status
    const isWishlistedStatus = useMemo(() => isProductWishlisted(product.id), [
        isProductWishlisted,
        product.id,
    ]);

    // 3. Price calculation (unchanged)
    const { displayPrice, originalPrice, discountPercent } = useMemo(() => {
        const dPrice = selectedVariant
            ? parseFloat(selectedVariant.offer_price)
            : parseFloat(product.min_offer_price || product.min_price || product.price || "0");
        
        const oPrice = selectedVariant
            ? parseFloat(selectedVariant.price)
            : parseFloat(product.min_price || product.price || "0");

        const dPercent =
            oPrice > dPrice
                ? Math.round(((oPrice - dPrice) / oPrice) * 100)
                : 0;
        
        return {
            displayPrice: dPrice.toFixed(0),
            originalPrice: oPrice.toFixed(0),
            discountPercent: dPercent
        };
    }, [product, selectedVariant]);


    // --- HANDLERS ---

    const handleCardClick = useCallback(() => {
        navigate(`/product/${product.id}`, { 
            state: { 
                product,
                selectedVariant 
            } 
        });
    }, [navigate, product, selectedVariant]);

    const handleVariationChange = useCallback(
        (e) => {
            e.stopPropagation();
            const variantId = parseInt(e.target.value);
            const variant = product.variations.find(
                (v) => v.id === variantId
            );
            setSelectedVariant(variant);
            setError(null);
        },
        [product.variations]
    );

    const handleWishlistClick = useCallback(async (e) => {
        e.stopPropagation();
        if (isTogglingWishlist) return;
        
        setIsTogglingWishlist(true);
        try {
            await toggleWishlist(product.id);
        } catch (err) {
            console.error("Failed to toggle wishlist:", err);
        } finally {
            setIsTogglingWishlist(false);
        }
    }, [isTogglingWishlist, toggleWishlist, product.id]);

    const handleAddToCart = useCallback(
        async (e) => {
            e.stopPropagation();

            if (!selectedVariant && hasVariations) {
                setError("Please select a variant");
                return;
            }
            if (isInCart) return; // Prevent adding if already in cart

            setIsAddingToCart(true);
            setError(null);

            try {
                const productVariantId = getVariantId();
                const existingItem = findItemInCart(product.id, productVariantId);
                // If it's in the cart, increment. If not (or quantity is 0), add 1.
                const currentQty = existingItem ? existingItem.quantity : 0;
                const nextQty = currentQty + 1;

                await addItemToCart(productVariantId, nextQty);
                // isInCart will automatically update due to useMemo
                
            } catch (error) {
                console.error("addItemToCart error:", error);
                setError("Failed to add. Try again.");
            } finally {
                setTimeout(() => setIsAddingToCart(false), 500); 
            }
        },
        [addItemToCart, hasVariations, findItemInCart, product.id, getVariantId, selectedVariant, isInCart]
    );

    const handleBuyNow = useCallback(
        async (e) => {
            e.stopPropagation();

            const token = localStorage.getItem("accessToken");
            if (!token) {
                setError("Please login to continue");
                setTimeout(
                    () => navigate("/login", { state: { from: "/cart" } }),
                    1500
                );
                return;
            }

            if (!selectedVariant && hasVariations) {
                setError("Please select a variant");
                return;
            }

            setIsAddingToCart(true); 

            try {
                const productVariantId = getVariantId();
                const existingItem = findItemInCart(product.id, productVariantId);
                
                if (!existingItem) {
                    await addItemToCart(productVariantId, 1);
                }

                navigate("/cart", {
                    state: {
                        buyNowProduct: product.id,
                        buyNowVariant: selectedVariant?.id,
                    },
                });
            } catch (error) {
                console.error("Buy now failed:", error);
                setError("Failed to proceed.");
            } finally {
                setIsAddingToCart(false);
            }
        },
        [product.id, selectedVariant, navigate, addItemToCart, hasVariations, findItemInCart, getVariantId]
    );

    // Determine the button state and content using the persistent status (isInCart)
    const buttonText = isAddingToCart ? "Adding..." : (isInCart ? "Added" : "Add");
    const cartIcon = isInCart ? Check : ShoppingCart;
    const isDisabled = isAddingToCart || (!selectedVariant && hasVariations) || isTogglingWishlist || isInCart;
    // Use 'added-once' class for the permanent "Added" visual state
    const buttonClass = `product-cart-btn ${isAddingToCart ? "adding" : ""} ${isInCart ? "added-once" : ""}`;


    // --- RENDER ---
    return (
        <div className="product-card product-card-animate" onClick={handleCardClick}>
            {/* Discount Badge */}
            {discountPercent > 0 && (
                <div className="product-discount-badge">{discountPercent}% OFF</div>
            )}

            {/* Image Section */}
            <div className="product-image-container">
                <img
                    src={getImageUrl(product.image || product.image_url)}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150?text=No+Image";
                    }}
                />

                {/* Wishlist Button */}
                <button
                    className={`product-wishlist-btn ${isWishlistedStatus ? "wishlisted" : ""}`}
                    onClick={handleWishlistClick}
                    disabled={isTogglingWishlist} 
                    aria-label={isWishlistedStatus ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart
                        className="product-wishlist-icon"
                        fill={isWishlistedStatus ? "currentColor" : "none"}
                    />
                </button>
            </div>

            {/* Details Section */}
            <div className="product-details">
                <div className="product-brand">
                    {product.brand && product.brand !== "null" ? product.brand : "Fresh"}
                </div>

                <h3 className="product-name">{product.name}</h3>

                {/* Variation Dropdown */}
                {hasVariations ? (
                    <select
                        className="product-variation-select"
                        onChange={handleVariationChange}
                        value={selectedVariant?.id}
                        disabled={isAddingToCart || isTogglingWishlist || isInCart}
                        aria-label="Select variant"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        {product.variations.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.value} - ₹{parseFloat(v.offer_price).toFixed(0)}
                            </option>
                        ))}
                    </select>
                ) : (
                    <div className="product-variation-spacer"></div>
                )}

                {/* Error Message */}
                {error && <div className="product-error-message">{error}</div>}

                {/* Price Section */}
                <div className="product-price-container">
                    <span className="product-price">
                        ₹{displayPrice}
                    </span>
                    {originalPrice > displayPrice && (
                        <span className="product-original-price">
                            ₹{originalPrice}
                        </span>
                    )}
                </div>

                {/* Action Buttons - ALWAYS SHOW ADD & BUY */}
                <div className="product-actions">
                    <button
                        className={buttonClass}
                        onClick={handleAddToCart}
                        disabled={isDisabled}
                        aria-label={isInCart ? "Item added to cart" : "Add to cart"}
                    >
                        {React.createElement(cartIcon, { className: "product-btn-icon" })}
                        <span>{buttonText}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;