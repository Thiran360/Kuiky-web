// src/components/ProductCard/ProductCard.js

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import { getImageUrl } from "../../api/config";
import "./ProductCard.css";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
// 1. Import Wishlist Context
import { useWishlist } from "../../context/WishlistContext";


const ProductCard = ({ product }) => {
    // --- HOOKS ---
    const { addItemToCart, findItemInCart } = useCart();
    const navigate = useNavigate();
    
    // 2. Access Wishlist Context functions
    const { isProductWishlisted, toggleWishlist } = useWishlist();

    const hasVariations = product.variations && product.variations.length > 0;

    const [selectedVariant, setSelectedVariant] = useState(
        hasVariations ? product.variations[0] : null
    );
    // 3. REMOVE local isWishlisted state and use context derivation
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    // 4. Add state for controlling the wishlist button loading
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false); 
    const [error, setError] = useState(null);

    // Update selected variant if product changes
    useEffect(() => {
        setSelectedVariant(hasVariations ? product.variations[0] : null);
    }, [product, hasVariations]);

    // 5. Derive wishlisted status from context for display logic
    const isWishlistedStatus = useMemo(() => isProductWishlisted(product.id), [
        isProductWishlisted,
        product.id,
    ]);


    // Memoize the Variant ID logic
    const getVariantId = useCallback(() => selectedVariant?.id || null, [selectedVariant]);

    // --- PRICE CALCULATION (Unchanged) ---
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

    /**
     * 6. New handler using toggleWishlist from context
     */
    const handleWishlistClick = useCallback(async (e) => {
        e.stopPropagation();
        if (isTogglingWishlist) return;
        
        setIsTogglingWishlist(true);
        try {
            await toggleWishlist(product.id);
        } catch (err) {
            console.error("Failed to toggle wishlist:", err);
            // Context handles the alert for login/server errors
        } finally {
            setIsTogglingWishlist(false);
        }
    }, [isTogglingWishlist, toggleWishlist, product.id]);

    /**
     * ADD BUTTON HANDLER (Unchanged logic, added isTogglingWishlist to dependencies for robustness)
     */
    const handleAddToCart = useCallback(
        async (e) => {
            e.stopPropagation();

            if (!selectedVariant && hasVariations) {
                setError("Please select a variant");
                return;
            }

            setIsAddingToCart(true);
            setError(null);

            try {
                const productVariantId = getVariantId();
                
                // Get current quantity and calculate next quantity
                const existingItem = findItemInCart(product.id, productVariantId);
                const currentQty = existingItem ? existingItem.quantity : 0;
                const nextQty = currentQty + 1;

                await addItemToCart(productVariantId, nextQty);
                
            } catch (error) {
                console.error("addItemToCart error:", error);
                setError("Failed to add. Try again.");
            } finally {
                // Short delay for visual feedback
                setTimeout(() => setIsAddingToCart(false), 500); 
            }
        },
        [
            addItemToCart,
            hasVariations,
            findItemInCart,
            product.id, 
            getVariantId,
            selectedVariant
        ]
    );

    /**
     * BUY NOW HANDLER (Unchanged logic, added isTogglingWishlist to dependencies for robustness)
     */
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

            setIsAddingToCart(true); // Show loading state

            try {
                const productVariantId = getVariantId();
                const existingItem = findItemInCart(product.id, productVariantId);
                
                // Ensure at least 1 of the selected product/variant is in the cart
                if (!existingItem) {
                    await addItemToCart(productVariantId, 1);
                }

                // Navigate directly to the cart/checkout page
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
        [
            product.id,
            selectedVariant,
            navigate,
            addItemToCart,
            hasVariations,
            findItemInCart,
            getVariantId
        ]
    );

    // --- RENDER ---
    return (
        <div className="product-card product-card-animate" onClick={() => navigate(`/product/${product.id}`)}>
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
                    className={`product-wishlist-btn ${
                        // 7. Use the derived status for CSS class
                        isWishlistedStatus ? "wishlisted" : ""
                    }`}
                    onClick={handleWishlistClick}
                    // 7. Disable button when toggling
                    disabled={isTogglingWishlist} 
                    aria-label={isWishlistedStatus ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart
                        className="product-wishlist-icon"
                        // 7. Use the derived status for fill color
                        fill={isWishlistedStatus ? "currentColor" : "none"}
                    />
                </button>
            </div>

            {/* Details Section (Unchanged) */}
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
                        disabled={isAddingToCart || isTogglingWishlist}
                        aria-label="Select variant"
                        // Prevent the card click handler from triggering when selecting variant
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
                        className={`product-cart-btn ${isAddingToCart ? "adding" : ""}`}
                        onClick={handleAddToCart}
                        disabled={isAddingToCart || (!selectedVariant && hasVariations) || isTogglingWishlist}
                        aria-label="Add to cart"
                    >
                        <ShoppingCart className="product-btn-icon" />
                        <span>{isAddingToCart ? "Adding..." : "Add"}</span>
                    </button>

                    <button
                        className="product-buy-btn"
                        onClick={handleBuyNow}
                        disabled={isAddingToCart || (!selectedVariant && hasVariations) || isTogglingWishlist}
                        aria-label="Buy now"
                    >
                        <Zap className="product-btn-icon" />
                        <span>Buy</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;