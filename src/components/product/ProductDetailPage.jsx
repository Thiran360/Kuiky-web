// src/pages/ProductDetailPage/ProductDetailPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
    Heart, 
    ShoppingCart, 
    Zap, 
    ArrowLeft, 
    Plus, 
    Minus, 
    Star, 
    ShieldCheck, 
    Truck, 
    RotateCcw,
    Share2,
    Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "../../api/config";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useUser } from "../../context/UserContext";
import api from "../../api/api";
import { API_ENDPOINTS } from "../../api/endpoints";
import { useSmartImage } from "../../api/imageService";
import "./ProductDetailPage.css";

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { addItemToCart, findItemInCart } = useCart();
    const { isProductWishlisted, toggleWishlist } = useWishlist();
    const { isAuthenticated } = useUser();

    // Get product from location state or fetch from API
    const [product, setProduct] = useState(location.state?.product || null);
    const [isLoading, setIsLoading] = useState(!location.state?.product);
    const [reviews, setReviews] = useState([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
    const [error, setError] = useState(null);

    // Review states
    const [isWritingReview, setIsWritingReview] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const hasVariations = product?.variations && product.variations.length > 0;
    const [selectedVariant, setSelectedVariant] = useState(null);

    // Initial variant selection
    useEffect(() => {
        if (product && hasVariations && !selectedVariant) {
            setSelectedVariant(product.variations[0]);
        }
    }, [product, hasVariations, selectedVariant]);

    // Fetch product if not passed via state
    useEffect(() => {
        if (!product && id) {
            fetchProduct(id);
        }
        if (id) {
            fetchReviews(id);
        }
    }, [id, product]);

    const fetchProduct = async (productId) => {
        setIsLoading(true);
        setError(null);
        try {   
            const res = await api.get(`/products/${productId}/`);
            if (res.data) {
                setProduct(res.data);
            } else {
                setError("Product not found");
            }
        } catch (err) {
            console.error("Failed to fetch product:", err);
            // Fallback: try searching in all products if detail fetch fails
            try {
                const listRes = await api.get("/products/");
                const products = Array.isArray(listRes.data) ? listRes.data : (listRes.data.results || []);
                const found = products.find(p => String(p.id) === String(productId));
                if (found) {
                    setProduct(found);
                } else {
                    setError("Unable to find this product. It may have been removed.");
                }
            } catch (listErr) {
                setError("Network error. Please check your connection.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchReviews = async (productId) => {
        setIsLoadingReviews(true);
        try {
            const res = await api.get(`/reviews/${productId}/`);
            setReviews(Array.isArray(res.data) ? res.data : (res.data.results || []));
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
            setReviews([]);
        } finally {
            setIsLoadingReviews(false);
        }
    };

    const isWishlistedStatus = useMemo(
        () => product && isProductWishlisted(product.id),
        [isProductWishlisted, product]
    );

    const isInCart = useMemo(() => {
        if (!product) return false;
        const variantId = selectedVariant?.id || null;
        return !!findItemInCart(product.id, variantId);
    }, [product, selectedVariant, findItemInCart]);

    const { displayPrice, originalPrice, discountPercent } = useMemo(() => {
        if (!product) return { displayPrice: 0, originalPrice: 0, discountPercent: 0 };

        const dPrice = selectedVariant
            ? parseFloat(selectedVariant.offer_price)
            : parseFloat(product.min_offer_price || product.min_price || product.price || 0);

        const oPrice = selectedVariant
            ? parseFloat(selectedVariant.price)
            : parseFloat(product.min_price || product.price || 0);

        const dPercent = oPrice > dPrice ? Math.round(((oPrice - dPrice) / oPrice) * 100) : 0;

        return {
            displayPrice: dPrice.toFixed(0),
            originalPrice: oPrice.toFixed(0),
            discountPercent: dPercent,
        };
    }, [product, selectedVariant]);

    const handleMouseMove = useCallback((e) => {
        if (!isZoomed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    }, [isZoomed]);

    const handleAddToCart = async () => {
        if (!product) return;
        // 💎 AUTH-MANDATORY: Redirect guests to Membership Portal
        if (!isAuthenticated) { 
            navigate("/login", { state: { from: `/product/${product.id}` } });
            return; 
        }
        if (hasVariations && !selectedVariant) {
            setError("Please select a variant first");
            return;
        }

        setIsAddingToCart(true);
        setError(null);
        try {
            await addItemToCart(selectedVariant?.id || null, quantity, product);
            // Show feedback here if needed
        } catch (err) {
            setError(err.message || "Failed to add to cart");
        } finally {
            setTimeout(() => setIsAddingToCart(false), 600);
        }
    };

    const handleWishlistClick = useCallback(async () => {
        if (isTogglingWishlist || !product) return;

        // 💎 AUTH-MANDATORY: Redirect guests to Membership Portal
        if (!isAuthenticated) { 
            navigate("/login"); 
            return; 
        }

        setIsTogglingWishlist(true);
        setError(null);
        try {
            // 💎 PASS FULL ASSET: Ensure guests see full product metadata in wishlist
            await toggleWishlist(product.id, product);
        } catch (err) {
            console.error("Failed to toggle wishlist:", err);
            setError("Failed to update wishlist");
        } finally {
            setIsTogglingWishlist(false);
        }
    }, [isTogglingWishlist, toggleWishlist, product, isAuthenticated, navigate]);

    const handleBuyNow = async () => {
        if (!product) return;
        if (!isAuthenticated) {
            setError("Please login to checkout");
            navigate("/login", { state: { from: `/product/${product.id}` } });
            return;
        }
        
        try {
            const variantId = selectedVariant?.id || null;
            if (!findItemInCart(product.id, variantId)) {
                await addItemToCart(variantId, quantity, product);
            }
            navigate("/cart");
        } catch (err) {
            setError("Failed to proceed to checkout");
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: product?.name || "Check this out!",
            text: `Take a look at ${product?.name} on ShopConnect`,
            url: window.location.href,
        };
        
        if (navigator.share) {
            try { await navigator.share(shareData); } 
            catch (err) { console.error("Error sharing:", err); }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Product link copied to clipboard!");
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            setError("Please login to submit a review");
            return;
        }
        if (!newReview.comment.trim()) return;

        setIsSubmittingReview(true);
        setError(null);
        try {
            const payload = {
                product: product.id,
                rating: newReview.rating,
                comment: newReview.comment
            };
            const res = await api.post(API_ENDPOINTS.REVIEWS_ADD, payload);
            // Optimistically prepend the newly created review mapping to API shape
            setReviews([res.data, ...reviews]);
            setNewReview({ rating: 5, comment: "" });
            setIsWritingReview(false);
        } catch (err) {
            setError("Failed to submit review online");
            console.error("Review fail:", err);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const productImages = useMemo(() => {
        if (!product) return [];
        // 🚀 Browser-validated priority: image_url is the functioning path on this server
        const primarySource = product.image_url || product.image;
        const secondaryImages = product.images && Array.isArray(product.images) ? product.images : [];
        return [primarySource, ...secondaryImages].filter(Boolean);
    }, [product]);

    if (isLoading) {
        return (
            <div className="product-detail-skeleton">
                <div className="skeleton-container">
                    <div className="skeleton-image" />
                    <div className="skeleton-info">
                        <div className="skeleton-line title" />
                        <div className="skeleton-line price" />
                        <div className="skeleton-line desc" />
                        <div className="skeleton-line action" />
                    </div>
                </div>
            </div>
        );
    }

    if (error && !product) {
        return (
            <div className="detail-page-error">
                <div className="error-card">
                    <Info size={48} className="error-icon" />
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate(-1)} className="premium-button secondary">
                        <ArrowLeft size={18} /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="product-detail-page"
        >
            <div className="detail-container">
                {/* NAVIGATION BAR */}
                <div className="detail-nav">
                    <button className="glass-back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                    <div className="nav-actions">
                        <button className="icon-action-btn" onClick={handleShare}>
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="detail-content-grid">
                    {/* LEFT: IMAGE GALLERY */}
                    <div className="gallery-section">
                        <div className="main-image-wrapper">
                            {discountPercent > 0 && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="dynamic-badge discount"
                                >
                                    {discountPercent}% OFF
                                </motion.div>
                            )}
                            
                            <div 
                                className={`image-zoom-viewport ${isZoomed ? "active" : ""}`}
                                onMouseEnter={() => setIsZoomed(true)}
                                onMouseLeave={() => setIsZoomed(false)}
                                onMouseMove={handleMouseMove}
                            >
                                <AnimatePresence mode="wait">
                                    <DetailImageWrapper 
                                        key={selectedImage}
                                        src={productImages[selectedImage]}
                                        alt={product.name}
                                        isZoomed={isZoomed}
                                        zoomPosition={zoomPosition}
                                    />
                                </AnimatePresence>
                                {!isZoomed && (
                                    <div className="interaction-hint">
                                        <Zap size={12} fill="currentColor" /> Hover to Zoom
                                    </div>
                                )}
                            </div>
                        </div>

                        {productImages.length > 1 && (
                            <div className="gallery-thumbnails">
                                {productImages.map((img, idx) => (
                                    <motion.button
                                        whileHover={{ y: -4 }}
                                        whileTap={{ scale: 0.95 }}
                                        key={idx}
                                        className={`thumb-btn ${selectedImage === idx ? "active" : ""}`}
                                        onClick={() => setSelectedImage(idx)}
                                    >
                                        <img src={getImageUrl(img)} alt="Thumbnail" />
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: PRODUCT INFO */}
                    <div className="info-section">
                        <header className="info-header">
                            <span className="brand-label">{product.brand || "Authentic Product"}</span>
                            <h1 className="product-title-dynamic">{product.name}</h1>
                            <div className="ratings-summary">
                                <div className="stars-row">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill={i < Math.floor(product.rating || 4) ? "var(--primary-brand)" : "none"} color="var(--primary-brand)" />
                                    ))}
                                </div>
                                <span className="reviews-count">{product.rating || "4.5"} ({product.reviews || "120"} reviews)</span>
                            </div>
                        </header>

                        <section className="pricing-dynamic">
                            <div className="price-main-row">
                                <div className="price-primary">
                                    <span className="currency">₹</span>
                                    <span className="value">{displayPrice}</span>
                                </div>
                                {originalPrice > displayPrice && (
                                    <div className="price-secondary">
                                        <span className="orig">₹{originalPrice}</span>
                                        <span className="saving">Save ₹{originalPrice - displayPrice}</span>
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="divider-glow" />

                        {hasVariations && (
                            <section className="variants-choice">
                                <label>Available Variations</label>
                                <div className="variants-grid">
                                    {product.variations.map((v) => (
                                        <button
                                            key={v.id}
                                            className={`variant-card ${selectedVariant?.id === v.id ? "selected" : ""}`}
                                            onClick={() => {
                                                setSelectedVariant(v);
                                                setError(null);
                                            }}
                                        >
                                            <span className="v-value">{v.value}</span>
                                            <span className="v-price">₹{parseFloat(v.offer_price).toFixed(0)}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="purchase-controls">
                            <div className="quantity-selector-premium">
                                <label>Quantity</label>
                                <div className="qty-picker">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>
                                        <Minus size={16} />
                                    </button>
                                    <span className="qty-val">{quantity}</span>
                                    <button onClick={() => setQuantity(q => q + 1)}>
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    className="dynamic-error-toast"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div className="action-buttons-group">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className={`wishlist-toggle-btn ${isWishlistedStatus ? "active" : ""}`}
                                    onClick={handleWishlistClick}
                                    disabled={isTogglingWishlist}
                                >
                                    <Heart fill={isWishlistedStatus ? "currentColor" : "none"} size={20} />
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    className={`cart-primary-btn ${isInCart ? "added" : ""} ${isAddingToCart ? "loading" : ""}`}
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart}
                                >
                                    {isInCart ? <ShieldCheck size={18} /> : <ShoppingCart size={18} />}
                                    <span>{isInCart ? "IN CART" : (isAddingToCart ? "Adding..." : "ADD TO CART")}</span>
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    className="buy-now-premium-btn"
                                    onClick={handleBuyNow}
                                >
                                    <Zap size={18} fill="currentColor" />
                                    <span>Buy Now</span>
                                </motion.button>
                            </div>
                        </section>

                        <div className="product-highlights">
                            <div className="highlight-item">
                                <div className="icon-circ"><Truck size={18} /></div>
                                <span>Fast Delivery</span>
                            </div>
                            <div className="highlight-item">
                                <div className="icon-circ"><RotateCcw size={18} /></div>
                                <span>7 Day Return</span>
                            </div>
                            <div className="highlight-item">
                                <div className="icon-circ"><ShieldCheck size={18} /></div>
                                <span>Quality Assured</span>
                            </div>
                        </div>

                        <section className="collapsible-details">
                            <div className="detail-tab active">
                                <h3>Product Overview</h3>
                                <p>{product.description || "Indulge in the premium quality of our carefully sourced products. Designed for excellence and durability, this item meets the highest standards of production."}</p>
                            </div>
                            
                            <div className="specifications-grid">
                                <div className="spec-item">
                                    <span className="s-label">Category</span>
                                    <span className="s-value">{product.category || "General"}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="s-label">Availability</span>
                                    <span className="s-value in-stock">In Stock</span>
                                </div>
                                {product.weight && (
                                    <div className="spec-item">
                                        <span className="s-label">Weight</span>
                                        <span className="s-value">{product.weight} {product.unit}</span>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* REVIEWS SECTION */}
                        <section className="reviews-dynamic-section">
                            <div className="section-header-row">
                                <h3>Customer Reviews</h3>
                                <div className="avg-badge">
                                    <Star size={14} fill="white" />
                                    <span>{product.rating || "4.5"}</span>
                                </div>
                            </div>
                            
                            {!isWritingReview ? (
                                <button className="premium-button secondary outline-thick" onClick={() => setIsWritingReview(true)}>
                                    Write a Review
                                </button>
                            ) : (
                                <form onSubmit={handleSubmitReview} className="dynamic-review-form">
                                    <div className="rating-selector-stars">
                                        {[1, 2, 3, 4, 5].map(starIdx => (
                                            <button 
                                                key={starIdx} 
                                                type="button" 
                                                className="star-pick-btn"
                                                onClick={() => setNewReview({ ...newReview, rating: starIdx })}
                                            >
                                                <Star 
                                                    size={24} 
                                                    fill={starIdx <= newReview.rating ? "var(--primary-brand)" : "none"} 
                                                    color="var(--primary-brand)" 
                                                    strokeWidth={1.5}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea 
                                        className="premium-textarea"
                                        placeholder="Share your glorious experience with this product..."
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        rows="4"
                                    />
                                    <div className="review-action-row">
                                        <button type="button" className="text-btn muted" onClick={() => setIsWritingReview(false)}>Cancel</button>
                                        <button 
                                            type="submit" 
                                            className={`premium-btn black small ${isSubmittingReview ? 'loading' : ''}`}
                                            disabled={!newReview.comment.trim() || isSubmittingReview}
                                        >
                                            {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="reviews-list" style={{ marginTop: '2rem' }}>
                                {isLoadingReviews ? (
                                    <div className="small-spinner"></div>
                                ) : reviews.length > 0 ? (
                                    reviews.map((review, idx) => (
                                        <motion.div 
                                            key={review.id || idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="review-card-premium"
                                        >
                                            <div className="review-top">
                                                <div className="reviewer-info">
                                                    <div className="reviewer-avatar">
                                                        {(review.user_name || "C")?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="reviewer-name">{review.user_name || "Customer"}</span>
                                                        <div className="review-stars">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={12} fill={i < review.rating ? "var(--primary-brand)" : "none"} color="var(--primary-brand)" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="review-date">{new Date(review.created_at || Date.now()).toLocaleDateString()}</span>
                                            </div>
                                            <p className="review-comment">{review.comment || "Great product, highly recommend it!"}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="empty-reviews">
                                        <p>No reviews yet. Be the first to share your experience!</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

/**
 * Sub-component to manage smart image loading for the zoom engine
 */
const DetailImageWrapper = ({ src: rawPath, alt, isZoomed, zoomPosition }) => {
    const { src } = useSmartImage(rawPath);
    return (
        <motion.img
            initial={{ opacity: 0, x: 20 }}
            animate={{ 
                opacity: 1, 
                x: 0,
                scale: isZoomed ? 2.5 : 1
            }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ 
                scale: { type: "tween", duration: 0.2, ease: "easeOut" }
            }}
            src={src}
            alt={alt}
            className="presentation-image"
            style={{
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                cursor: isZoomed ? "zoom-out" : "zoom-in"
            }}
            onError={(e) => {
                if (!e.target.src.includes('no-image')) {
                    e.target.src = getImageUrl(null);
                }
            }}
        />
    );
};

export default ProductDetailPage;