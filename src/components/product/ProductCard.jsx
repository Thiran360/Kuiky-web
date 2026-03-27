import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Check, Star, Eye, Zap, Package, Loader } from "lucide-react"; 
import { useSmartImage } from "../../api/imageService";
import { getImageUrl } from "../../api/config";
import "./ProductCard.css";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useUser } from "../../context/UserContext";

/** Safe price parser — returns '0' instead of NaN */
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

    // 🛡️ Data Priority: Browser testing confirms 'image_url' is more reliable than 'image' on this backend
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
        // 💎 AUTH-MANDATORY: Redirect guests to Membership Portal
        if (!isAuthenticated) { 
            navigate("/login"); 
            return; 
        }
        if (isInCart) return;
        setIsAddingToCart(true);
        try {
            await addItemToCart(selectedVariant?.id || null, 1, product);
        } catch (err) { console.error(err); } finally { setIsAddingToCart(false); }
    };

    const handleWishlist = async (e) => {
        e.stopPropagation();
        if (!isAuthenticated) { 
            navigate("/login"); 
            return; 
        }
        if (isTogglingWishlist) return;
        setIsTogglingWishlist(true);
        try { await toggleWishlist(product.id, product); } finally { setIsTogglingWishlist(false); }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`elite-asset-capsule ${isHovered ? 'capsule-active' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate(`/product/${product.id}`)}
        >
            <div className="capsule-hologram-shimmer"></div>
            
            {/* PROCUREMENT STATUS */}
            <div className="capsule-status-ecom360">
                {discountPercent > 0 && <span className="status-pill discount"><Zap size={10} /> {discountPercent}% OFF</span>}
                <button 
                    className={`status-pill wishlist ${isWishlisted ? 'active' : ''}`}
                    onClick={handleWishlist}
                >
                    <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
            </div>

            {/* ASSET VISUAL */}
            <div className="capsule-visual-ecom360">
                {!imgLoaded && <div className="visual-skeleton"><div className="shimmer"></div></div>}
                <motion.img
                    animate={{ scale: isHovered ? 1.08 : 1 }}
                    src={imageSrc}
                    alt={product.name}
                    className="asset-visual"
                    onError={(e) => { e.target.src = "/images/no-image.png"; }}
                />
            </div>

            {/* ASSET DOSSIER */}
            <div className="capsule-dossier-ecom360">
                <div className="dossier-meta">
                    <span className="brand-badge">{product.brand || "ELITE ASSET"}</span>
                    <div className="rating-mini"><Star size={10} fill="currentColor" /> <span>{product.rating || "5.0"}</span></div>
                </div>

                <h3 className="asset-title-luxe">{product.name}</h3>
                
                <div className="asset-specs-preview">
                    <div className="spec-node"><Package size={12} /> <span>LOGISTICS READY</span></div>
                    <div className="spec-node"><Check size={12} /> <span>AUTH SECURED</span></div>
                </div>

                {hasVariations && (
                    <div className="variant-ecom360-mini" onClick={e => e.stopPropagation()}>
                        {product.variations.slice(0, 3).map(v => (
                            <button 
                                key={v.id} 
                                className={`v-pill-mini ${selectedVariant?.id === v.id ? 'active' : ''}`}
                                onClick={() => setSelectedVariant(v)}
                            >
                                {v.weight || v.value}
                            </button>
                        ))}
                    </div>
                )}

                <div className="asset-financial-ecom360">
                    <div className="price-block">
                        <span className="price-current">₹{displayPrice}</span>
                        {originalPrice > displayPrice && <span className="price-strike">₹{originalPrice}</span>}
                    </div>
                    <button 
                        className={`btn-procure-action ${isInCart ? 'authorized' : ''}`}
                        onClick={handleAddToCart}
                        disabled={isAddingToCart || isInCart}
                    >
                        {isAddingToCart ? <Loader size={14} className="spin" /> : 
                         isInCart ? <><Check size={14} /> <span>IN CART</span></> : 
                         <><ShoppingCart size={14} /> <span>ADD TO CART</span></>}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;