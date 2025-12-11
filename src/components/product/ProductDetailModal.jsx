// src/components/ProductDetailModal/ProductDetailModal.jsx
import React, { useState } from 'react';
import { Heart, ShoppingCart, Zap, X } from 'lucide-react';
import { getImageUrl } from '../../api/config';
import './ProductDetailModal.css'; // NEW CSS FILE

const ProductDetailModal = ({ 
    product,
    closeModal,
    isWishlistedStatus,
    handleWishlistClick,
    isTogglingWishlist,
    selectedVariant,
    handleVariationChange,
    displayPrice,
    originalPrice,
    discountPercent,
    handleAddToCart,
    handleBuyNow,
    isAddingToCart,
    error,
    setError // Passed down from ProductCard.js
}) => {
    // State for controlling the zoom effect
    const [zoomActive, setZoomActive] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: '50%', y: '50%' });

    const imageUrl = getImageUrl(product.image || product.image_url);

    const handleMouseMove = (e) => {
        if (!zoomActive) return;

        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        
        setMousePosition({ x: `${x}%`, y: `${y}%` });
    };

    return (
        <div className="product-modal-backdrop" onClick={closeModal}>
            <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
                
                {/* Close Button */}
                <button className="modal-close-btn" onClick={closeModal} aria-label="Close product details">
                    <X size={24} />
                </button>

                {/* Modal Body Grid */}
                <div className="modal-body-grid">
                    
                    {/* LEFT: Image/Zoom Area */}
                    <div 
                        className="modal-image-container"
                        onMouseEnter={() => setZoomActive(true)}
                        onMouseLeave={() => setZoomActive(false)}
                        onMouseMove={handleMouseMove}
                        aria-label="Product image with zoom effect"
                    >
                        <div 
                            className={`image-zoom-area ${zoomActive ? 'zoomed' : ''}`}
                            style={{ 
                                backgroundImage: `url(${imageUrl})`, 
                                backgroundPosition: `${mousePosition.x} ${mousePosition.y}`
                            }}
                        >
                            <img src={imageUrl} alt={product.name} className="base-image" />
                        </div>
                    </div>

                    {/* RIGHT: Details Area */}
                    <div className="modal-details-container">
                        <div className="modal-header">
                            <h2 className="modal-product-name">{product.name}</h2>
                            <div className="modal-product-brand">
                                {product.brand && product.brand !== "null" ? product.brand : "Fresh"}
                            </div>
                            {discountPercent > 0 && (
                                <div className="modal-discount-badge">{discountPercent}% OFF</div>
                            )}
                        </div>

                        <div className="modal-price-section">
                            <span className="modal-price">
                                ₹{displayPrice}
                            </span>
                            {originalPrice > displayPrice && (
                                <span className="modal-original-price">
                                    ₹{originalPrice}
                                </span>
                            )}
                        </div>

                        {/* Variation Dropdown */}
                        {product.variations && product.variations.length > 0 ? (
                            <select
                                className="modal-variation-select"
                                onChange={handleVariationChange}
                                value={selectedVariant?.id}
                                disabled={isAddingToCart || isTogglingWishlist}
                            >
                                {product.variations.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.value} - ₹{parseFloat(v.offer_price).toFixed(0)}
                                    </option>
                                ))}
                            </select>
                        ) : null}
                        
                        {error && <div className="modal-error-message">{error}</div>}

                        {/* Action Buttons */}
                        <div className="modal-actions-bar">
                            <button
                                className={`modal-cart-btn ${isAddingToCart ? "adding" : ""}`}
                                onClick={handleAddToCart}
                                disabled={isAddingToCart || isTogglingWishlist || (!selectedVariant && product.variations && product.variations.length > 0)}
                            >
                                <ShoppingCart size={18} />
                                <span>{isAddingToCart ? "Adding..." : "Add to Cart"}</span>
                            </button>

                            <button
                                className="modal-buy-btn"
                                onClick={handleBuyNow}
                                disabled={isAddingToCart || isTogglingWishlist || (!selectedVariant && product.variations && product.variations.length > 0)}
                            >
                                <Zap size={18} />
                                <span>Buy Now</span>
                            </button>
                        </div>
                        
                        <button
                            className={`modal-wishlist-btn ${isWishlistedStatus ? "wishlisted" : ""}`}
                            onClick={handleWishlistClick}
                            disabled={isTogglingWishlist} 
                        >
                            <Heart size={20} fill={isWishlistedStatus ? "currentColor" : "none"} />
                            {isWishlistedStatus ? "Remove from Wishlist" : "Add to Wishlist"}
                        </button>

                        <p className="modal-description">
                            {product.description || "Fresh and highly recommended product details."}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;