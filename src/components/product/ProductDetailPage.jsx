// src/pages/ProductDetailPage/ProductDetailPage.js

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Heart, ShoppingCart, Zap, ArrowLeft, Plus, Minus, Star } from "lucide-react";
import { getImageUrl } from "../../api/config";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import "./ProductDetailPage.css";

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { addItemToCart, findItemInCart } = useCart();
    const { isProductWishlisted, toggleWishlist } = useWishlist();

    // Get product from location state or fetch from API
    const [product, setProduct] = useState(location.state?.product || null);
    const [isLoading, setIsLoading] = useState(!location.state?.product);

    const hasVariations = product?.variations && product.variations.length > 0;

    const [selectedVariant, setSelectedVariant] = useState(
        hasVariations ? product.variations[0] : null
    );
    const [quantity, setQuantity] = useState(1);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);

    // Fetch product if not passed via state
    useEffect(() => {
        if (!product && id) {
            // TODO: Replace with your actual API call
            fetchProduct(id);
        }
    }, [id, product]);

    const fetchProduct = async (productId) => {
        setIsLoading(true);
        try {
            // TODO: Replace with your actual API endpoint
            // const response = await fetch(`/api/products/${productId}`);
            // const data = await response.json();
            // setProduct(data);
            
            // For now, showing loading state (and simulating product data)
            setTimeout(() => {
                setProduct(p => p || { 
                    id: productId, 
                    name: "Fresh Premium Organic Apples (Simulated)", 
                    description: "High-quality organic apples, crisp, sweet, and perfect for snacking or baking. Sourced from sustainable farms.",
                    brand: "EcoFarm",
                    price: "250",
                    offer_price: "200",
                    rating: 4.5,
                    reviews: 120,
                    weight: "1 kg",
                    unit: "Bag",
                    image: "/images/apples_main.jpg",
                    images: ["/images/apples_side1.jpg", "/images/apples_side2.jpg"],
                    variations: [
                        { id: 101, value: "1 kg", price: "250", offer_price: "200" },
                        { id: 102, value: "2 kg", price: "450", offer_price: "380" },
                        { id: 103, value: "500g", price: "130", offer_price: "100" },
                    ]
                });
                setIsLoading(false);
            }, 500);
        } catch (err) {
            console.error("Failed to fetch product:", err);
            setError("Failed to load product");
            setIsLoading(false);
        }
    };

    // Update selected variant when product changes
    useEffect(() => {
        if (product) {
            setSelectedVariant(
                product.variations && product.variations.length > 0
                    ? product.variations[0]
                    : null
            );
        }
    }, [product]);

    const isWishlistedStatus = useMemo(
        () => product && isProductWishlisted(product.id),
        [isProductWishlisted, product]
    );

    const getVariantId = useCallback(() => selectedVariant?.id || null, [selectedVariant]);

    // Price calculation
    const { displayPrice, originalPrice, discountPercent } = useMemo(() => {
        if (!product) return { displayPrice: "0", originalPrice: "0", discountPercent: 0 };

        const dPrice = selectedVariant
            ? parseFloat(selectedVariant.offer_price)
            : parseFloat(product.min_offer_price || product.min_price || product.price || "0");

        const oPrice = selectedVariant
            ? parseFloat(selectedVariant.price)
            : parseFloat(product.min_price || product.price || "0");

        const dPercent =
            oPrice > dPrice ? Math.round(((oPrice - dPrice) / oPrice) * 100) : 0;

        return {
            displayPrice: dPrice.toFixed(0),
            originalPrice: oPrice.toFixed(0),
            discountPercent: dPercent,
        };
    }, [product, selectedVariant]);

    // Image zoom handlers
    const handleMouseMove = useCallback(
        (e) => {
            if (!isZoomed) return;

            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
        },
        [isZoomed]
    );
    
    // Check if current variant is in cart for persistent 'Added' state
    const isInCart = useMemo(() => {
        if (!product || !selectedVariant) return false;
        const productVariantId = getVariantId();
        return !!findItemInCart(product.id, productVariantId);
    }, [product, selectedVariant, getVariantId, findItemInCart]);


    // Handlers
    const handleVariationChange = useCallback(
        (variantId) => {
            const variant = product.variations.find((v) => v.id === variantId);
            setSelectedVariant(variant);
            setError(null);
        },
        [product]
    );

    const handleWishlistClick = useCallback(async () => {
        if (isTogglingWishlist || !product) return;

        setIsTogglingWishlist(true);
        try {
            await toggleWishlist(product.id);
        } catch (err) {
            console.error("Failed to toggle wishlist:", err);
            setError("Failed to update wishlist");
        } finally {
            setIsTogglingWishlist(false);
        }
    }, [isTogglingWishlist, toggleWishlist, product]);

    const handleAddToCart = useCallback(async () => {
        if (!product) return;

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
            const currentQty = existingItem ? existingItem.quantity : 0;
            const nextQty = currentQty + quantity;

            await addItemToCart(productVariantId, nextQty);
        } catch (error) {
            console.error("addItemToCart error:", error);
            setError("Failed to add to cart. Try again.");
        } finally {
            setTimeout(() => setIsAddingToCart(false), 500);
        }
    }, [addItemToCart, hasVariations, findItemInCart, product, getVariantId, selectedVariant, quantity, isInCart]);

    const handleBuyNow = useCallback(async () => {
        if (!product) return;

        const token = localStorage.getItem("accessToken");
        if (!token) {
            setError("Please login to continue");
            setTimeout(() => navigate("/login", { state: { from: `/product/${product.id}` } }), 1500);
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
                await addItemToCart(productVariantId, quantity);
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
    }, [product, selectedVariant, navigate, addItemToCart, hasVariations, findItemInCart, getVariantId, quantity]);

    const handleQuantityChange = useCallback((delta) => {
        setQuantity((prev) => Math.max(1, prev + delta));
    }, []);

    // Product images array (support multiple images)
    const productImages = useMemo(() => {
        if (!product) return [];
        const images = [product.image || product.image_url];
        // Add more images if available in your product data
        if (product.images && Array.isArray(product.images)) {
            images.push(...product.images);
        }
        return images.filter(Boolean);
    }, [product]);

    // Derived Action button states
    const isActionDisabled = isAddingToCart || (!selectedVariant && hasVariations);
    
    if (isLoading) {
        return (
            <div className="detail-page-loading">
                <div className="loading-spinner"></div>
                <p>Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="detail-page-error">
                <h2>Product not found</h2>
                <button onClick={() => navigate(-1)} className="back-button">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="product-detail-page">
            <div className="detail-container">
                {/* Header with Back Button */}
                <div className="detail-header">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ArrowLeft className="back-icon" />
                        <span>Back</span>
                    </button>
                </div>

                {/* Main Content */}
                <div className="detail-content">
                    {/* Left Side - Image Gallery */}
                    <div className="image-section">
                        {/* Discount Badge */}
                        {discountPercent > 0 && (
                            <div className="detail-discount-badge">{discountPercent}% OFF</div>
                        )}

                        {/* Main Image with Zoom */}
                        <div
                            className={`image-zoom-container ${isZoomed ? "zoomed" : ""}`}
                            onMouseEnter={() => setIsZoomed(true)}
                            onMouseLeave={() => setIsZoomed(false)}
                            onMouseMove={handleMouseMove}
                            // Enable click on mobile to zoom (toggle zoom)
                            onTouchStart={() => setIsZoomed(true)}
                            onTouchEnd={() => setIsZoomed(false)}
                        >
                            <img
                                src={getImageUrl(productImages[selectedImage])}
                                alt={product.name}
                                className="detail-product-image"
                                style={{
                                    transform: isZoomed ? "scale(2)" : "scale(1)",
                                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                }}
                                onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/600?text=No+Image";
                                }}
                            />
                            {/* Zoom hint updated for touch devices */}
                            <div className="zoom-hint">{isZoomed ? "Move to inspect" : "Hover/Tap to zoom"}</div>
                        </div>

                        {/* Thumbnail Images */}
                        {productImages.length > 1 && (
                            <div className="image-thumbnails">
                                {productImages.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`thumbnail ${selectedImage === index ? "active" : ""}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img
                                            src={getImageUrl(img)}
                                            alt={`${product.name} ${index + 1}`}
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/80?text=No+Image";
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Side - Product Details */}
                    <div className="details-section">
                        {/* Brand Badge */}
                        <div className="detail-brand-badge">
                            {product.brand && product.brand !== "null" ? product.brand : "Fresh"}
                        </div>

                        {/* Product Name */}
                        <h1 className="detail-product-name">{product.name}</h1>

                        {/* Rating (if available) */}
                        {product.rating && (
                            <div className="product-rating">
                                <div className="stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                                            className="star-icon"
                                        />
                                    ))}
                                </div>
                                <span className="rating-text">
                                    {product.rating} ({product.reviews || 0} reviews)
                                </span>
                            </div>
                        )}

                        {/* Price Section */}
                        <div className="detail-price-section">
                            <span className="detail-current-price">₹{displayPrice}</span>
                            {originalPrice > displayPrice && (
                                <>
                                    <span className="detail-original-price">₹{originalPrice}</span>
                                    <span className="detail-save-tag">Save {discountPercent}%</span>
                                </>
                            )}
                        </div>

                        {/* Variations */}
                        {hasVariations && (
                            <div className="variations-section">
                                <label className="section-label">Select Size / Variant</label>
                                <div className="variant-buttons">
                                    {product.variations.map((variant) => (
                                        <button
                                            key={variant.id}
                                            className={`variant-button ${
                                                selectedVariant?.id === variant.id ? "active" : ""
                                            }`}
                                            onClick={() => handleVariationChange(variant.id)}
                                        >
                                            <div className="variant-value">{variant.value}</div>
                                            <div className="variant-price">
                                                ₹{parseFloat(variant.offer_price).toFixed(0)}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}                      

                        {/* Error Message */}
                        {error && <div className="detail-error-message">{error}</div>}

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button
                                className={`wishlist-button ${isWishlistedStatus ? "active" : ""}`}
                                onClick={handleWishlistClick}
                                disabled={isTogglingWishlist}
                                aria-label={isWishlistedStatus ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                <Heart
                                    size={20}
                                    fill={isWishlistedStatus ? "currentColor" : "none"}
                                />
                            </button>

                            <button
                                className={`add-to-cart-button ${isAddingToCart ? "loading" : ""} ${isInCart ? "added-to-cart" : ""}`}
                                onClick={handleAddToCart}
                                disabled={isActionDisabled || isInCart}
                            >
                                <ShoppingCart size={20} />
                                <span>{isInCart ? "Added to Cart" : (isAddingToCart ? "Adding..." : "Add to Cart")}</span>
                            </button>

                            
                        </div>

                        {/* Product Description */}
                        <div className="description-section">
                            <h3 className="section-title">Product Description</h3>
                            <p className="description-text">
                                {product.description ||
                                    "Fresh and high-quality product delivered to your doorstep. Perfect for daily consumption and packed with essential nutrients. Our products are sourced from the finest suppliers to ensure the best quality for our customers."}
                            </p>
                        </div>

                        {/* Product Details Grid */}
                        <div className="product-info-grid">
                            <h3 className="section-title">Product Details</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Category</span>
                                    <span className="info-value">
                                        {product.category || "Groceries"}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Stock Status</span>
                                    <span className="info-value stock-available">In Stock</span>
                                </div>
                                {product.weight && (
                                    <div className="info-item">
                                        <span className="info-label">Weight</span>
                                        <span className="info-value">{product.weight}</span>
                                    </div>
                                )}
                                {product.unit && (
                                    <div className="info-item">
                                        <span className="info-label">Unit</span>
                                        <span className="info-value">{product.unit}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Features */}
                        <div className="features-section">
                            <h3 className="section-title">Why Choose This Product?</h3>
                            <ul className="features-list">
                                <li>✓ Fresh and high quality</li>
                                <li>✓ Fast delivery to your doorstep</li>
                                <li>✓ 100% satisfaction guaranteed</li>
                                <li>✓ Easy returns and refunds</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;