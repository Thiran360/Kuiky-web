/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Check, Star, Zap, CheckCircle2, Store, Loader2 } from "lucide-react";
import { useSmartImage } from "../../api/imageService";
import { getImageUrl } from "../../api/config";
import "./ProductCard.css";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useUser } from "../../context/UserContext";

const safePrice = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
};

const ProductCard = ({ product, index = 0 }) => {
    const { addItemToCart, findItemInCart } = useCart();
    const navigate = useNavigate();
    const { isProductWishlisted, toggleWishlist } = useWishlist();
    const { isAuthenticated } = useUser();

    const hasVariations = product.variations && product.variations.length > 0;
    const [selectedVariant, setSelectedVariant] = useState(
        hasVariations ? product.variations[0] : null
    );
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const { src: imageSrc, loaded: imgLoaded } = useSmartImage(
        product.image_url || product.image
    );

    useEffect(() => {
        setSelectedVariant(hasVariations ? product.variations[0] : null);
    }, [product, hasVariations]);

    const isInCart = useMemo(() => {
        return !!findItemInCart(product.id, selectedVariant?.id || null);
    }, [product.id, selectedVariant, findItemInCart]);

    const isWishlisted = useMemo(() => isProductWishlisted(product.id), [isProductWishlisted, product.id]);

    const { displayPrice, originalPrice, discountPercent } = useMemo(() => {
        const dPrice = selectedVariant
            ? safePrice(selectedVariant.offer_price)
            : safePrice(product.min_offer_price || product.price || 0);
        const oPrice = selectedVariant
            ? safePrice(selectedVariant.price)
            : safePrice(product.min_price || product.price || 0);
        const dPercent = oPrice > dPrice ? Math.round(((oPrice - dPrice) / oPrice) * 100) : 0;
        return { displayPrice: dPrice.toFixed(0), originalPrice: oPrice.toFixed(0), discountPercent: dPercent };
    }, [product, selectedVariant]);

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        if (isInCart) return;
        setIsAddingToCart(true);
        try {
            await addItemToCart(selectedVariant?.id || null, 1, product);
        } catch (err) {
            console.error(err);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleWishlist = async (e) => {
        e.stopPropagation();
        if (isTogglingWishlist) return;
        setIsTogglingWishlist(true);
        try { 
            await toggleWishlist(product.id, product); 
        } catch (err) { 
            console.error("Wishlist toggle error:", err); 
        } finally { 
            setIsTogglingWishlist(false); 
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.15) }}
            className={`pro-product-card ${isHovered ? 'card-hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate(`/product/${product.id}`)}
        >
            {/* TOP IMAGE CONTAINER */}
            <div className="pro-image-box">
                {/* Floating Discount Badge */}
                {discountPercent > 0 ? (
                    <span className="pro-discount-badge">
                        <Zap size={11} /> {discountPercent}% OFF
                    </span>
                ) : (
                    <span className="pro-fresh-badge">
                        <Zap size={11} /> Fast Delivery
                    </span>
                )}

                {/* Floating Wishlist Heart */}
                <button
                    className={`pro-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                    onClick={handleWishlist}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart size={18} strokeWidth={2.2} fill={isWishlisted ? "#e11d48" : "none"} />
                </button>

                {/* Main Product Image */}
                {!imgLoaded && <div className="pro-image-skeleton"></div>}
                <motion.img
                    animate={{ scale: isHovered ? 1.05 : 1 }}
                    transition={{ duration: 0.3 }}
                    src={imageSrc}
                    alt={product.name}
                    className="pro-product-img"
                    onError={(e) => {
                        const raw = product.image_url || product.image;
                        if (raw && !e.target.src.includes('api.codingboss.in')) {
                            const clean = raw.startsWith('/') ? raw.slice(1) : raw;
                            e.target.src = `https://api.codingboss.in/${clean}`;
                        } else if (!e.target.src.includes('no-image.png')) {
                            e.target.src = "/images/no-image.png";
                        }
                    }}
                />
            </div>

            {/* CARD BODY CONTENT */}
            <div className="pro-card-body">
                {/* Brand / Category & Rating */}
                <div className="pro-meta-row">
                    <span className="pro-brand-tag">
                        {product.brand || product.category || "KUIKY VERIFIED"}
                    </span>
                    <div className="pro-rating-pill">
                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                        <span>{product.rating || "4.8"}</span>
                    </div>
                </div>

                {/* Product Title */}
                <h3 className="pro-product-title" title={product.name}>
                    {product.name}
                </h3>

                {/* Quick Trust Badges */}
                <div className="pro-badges-row">
                    {product.shop_name ? (
                        <span className="pro-badge-pill">
                            <Store size={12} /> {product.shop_name}
                        </span>
                    ) : (
                        <span className="pro-badge-pill">
                            <CheckCircle2 size={12} /> 100% Genuine
                        </span>
                    )}
                    <span className="pro-badge-pill">
                        <Zap size={12} /> Quick Dispatch
                    </span>
                </div>

                {/* Variant Options Pills (If Any) */}
                {hasVariations && (
                    <div className="pro-variants-row" onClick={(e) => e.stopPropagation()}>
                        {product.variations.slice(0, 3).map((v) => (
                            <button
                                key={v.id}
                                className={`pro-variant-pill ${selectedVariant?.id === v.id ? 'active' : ''}`}
                                onClick={() => setSelectedVariant(v)}
                            >
                                {v.weight || v.value}
                            </button>
                        ))}
                    </div>
                )}

                {/* Price & Add to Cart Footer */}
                <div className="pro-card-footer">
                    <div className="pro-price-group">
                        <span className="pro-price-current">₹{displayPrice}</span>
                        {Number(originalPrice) > Number(displayPrice) && (
                            <span className="pro-price-original">₹{originalPrice}</span>
                        )}
                    </div>

                    <button
                        className={`pro-add-cart-btn ${isInCart ? 'in-cart' : ''}`}
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                    >
                        {isAddingToCart ? (
                            <Loader2 size={15} className="spin" />
                        ) : isInCart ? (
                            <>
                                <Check size={15} strokeWidth={2.5} />
                                <span>IN CART</span>
                            </>
                        ) : (
                            <>
                                <ShoppingBag size={15} />
                                <span>ADD TO CART</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;