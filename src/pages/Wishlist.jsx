import React, { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../api/config";
import { Trash2, ShoppingCart, Check, ArrowLeft, Heart, Zap, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./Wishlist.css";

/* ─── GUEST STATE (NOT LOGGED IN & EMPTY WISHLIST) ─── */
const GuestWishlistState = () => {
    const navigate = useNavigate();
    return (
        <div className="wishlist-page guest-luxe-state">
            <motion.div 
                className="wishlist-empty-luxe"
                initial={{ scale: 0.94, opacity: 0, y: 15 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
            >
                <div className="empty-luxe-visual">
                    <div className="empty-cart-icon-wrap">
                        <Heart size={46} className="text-rose-500 fill-rose-500/20" />
                    </div>
                </div>
                <h2 className="empty-luxe-title">Your Wishlist is Empty</h2>
                <p className="empty-luxe-text">
                    Sign in to your account to save products you love and sync them across all your devices.
                </p>
                <div className="cart-empty-actions-col">
                    <button className="btn-primary-cart-action" onClick={() => navigate("/login")}>
                        <Zap size={18} /> Sign In to Your Account
                    </button>
                    <button className="btn-secondary-cart-action" onClick={() => navigate("/")}>
                        <ArrowLeft size={16} /> Explore Products
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const Wishlist = () => {
  const { wishlist, loading, loadWishlist, toggleWishlist } = useWishlist();
  const { addItemToCart, refreshCart, findItemInCart } = useCart();
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (loadWishlist && isAuthenticated) {
      loadWishlist();
    }
  }, [loadWishlist, isAuthenticated]);

  if (!isAuthenticated && (!wishlist || wishlist.length === 0)) {
      return <GuestWishlistState />;
  }

  const getProduct = (item) => item.product || item;

  const getProductId = (item) => {
    if (!item) return null;
    const p = item.product || {};
    // 💎 ELITE ROYALE PRECISION: Priority mapping for product_id identification
    const potentialIds = [
      item.product_id, 
      p.id, 
      p.product_id, 
      item.id
    ];

    for (const id of potentialIds) {
      if (id != null && id !== "" && id !== "null") {
        const num = Number(id);
        if (!isNaN(num) && num > 0) return num;
      }
    }
    return null;
  };

  const getVariantForCart = (product) => {
    if (!product) return null;
    if (product.default_variant) return product.default_variant;
    if (product.variations?.length) return product.variations[0];
    return null;
  };

  const getWishlistPrice = (product) => {
    const variant = getVariantForCart(product);
    const offerPrices = [
      variant?.offer_price,
      product?.min_offer_price,
      product?.offer_price,
      product?.selling_price,
    ];
    const regularPrices = [
      variant?.price,
      product?.min_price,
      product?.price
    ];

    for (let p of [...offerPrices, ...regularPrices]) {
      if (p != null && p !== "null" && p !== "") {
        const parsed = Number(p);
        if (!isNaN(parsed) && parsed > 0) return Math.round(parsed);
      }
    }
    return 0;
  };

  const getWishlistOriginalPrice = (product) => {
    const variant = getVariantForCart(product);
    const prices = [
      variant?.price,
      product?.min_price,
      product?.price
    ];
    for (let p of prices) {
      if (p != null && p !== "null" && p !== "") {
        const parsed = Number(p);
        if (!isNaN(parsed) && parsed > 0) return Math.round(parsed);
      }
    }
    return getWishlistPrice(product);
  };

  const handleRemove = async (e, productId) => {
    e.stopPropagation();
    try {
      await toggleWishlist(productId);
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  const handleMoveToCart = async (e, product) => {
    e.stopPropagation();
    try {
      const variant = getVariantForCart(product);
      if (!variant?.id) return alert("Product variations not found");

      const productId = product?.id || product?.product_id;
      if (findItemInCart(productId, variant.id)) {
        await refreshCart();
        return;
      }
      await addItemToCart(variant.id, 1, product);
    } catch (err) {
      console.error("Cart move failed:", err);
    }
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <motion.div 
          className="wishlist-header-luxe"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button className="wishlist-back-btn-luxe" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} strokeWidth={2.5} /> BACK TO STORE
          </button>
          
          <div className="wishlist-title-container">
            <div className="wishlist-title-group-luxe">
              <div className="title-icon-wrapper-luxe">
                 <Heart size={24} className="title-heart-luxe" strokeWidth={2.5} />
                 <div className="title-icon-ring ripple-animation"></div>
              </div>
              <h1 className="wishlist-title-luxe">
                YOUR CURATION
              </h1>
            </div>
            <div className="wishlist-meta-luxe">
               <span className="meta-badge-luxe text-ruby">PRIVATE COLLECTION</span>
               <span className="meta-divider">•</span>
               <span className="meta-badge-luxe">{(wishlist?.length || 0)} {(wishlist?.length === 1 ? 'ITEM' : 'ITEMS')}</span>
            </div>
          </div>
          
          <div className="header-spacer-luxe"></div>
        </motion.div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading Wishlist...</p>
          </div>
        )}

        {!loading && (wishlist?.length || 0) === 0 && (
          <motion.div 
            className="wishlist-empty-luxe"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="empty-luxe-visual">
               <Heart size={80} strokeWidth={1} className="text-rose-200" />
               <div className="empty-glow-ruby"></div>
            </div>
            <h2 className="empty-luxe-title">Your Curation is Awaiting</h2>
            <p className="empty-luxe-text">Heart the items you love to build your personal luxury collection.</p>
            <button
              className="btn-elite-deployment m-0 w-auto px-12"
              onClick={() => navigate("/")}
            >
              <Zap size={18} /> START CURATING
            </button>
          </motion.div>
        )}

        {!loading && (wishlist?.length || 0) > 0 && (
          <div className="wishlist-grid-luxe">
            <AnimatePresence>
              {(wishlist || []).map((item, index) => {
                const product = getProduct(item);
                const productId = getProductId(item);
                if (!productId || !product) {
                  // Fallback ID for unique keys if somehow missing
                  const fallbackId = `fallback-${index}-${Date.now()}`;
                  return null; 
                }

                const price = Number(getWishlistPrice(product)) || 0;
                const originalPrice = Number(getWishlistOriginalPrice(product)) || price;
                const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                const variant = getVariantForCart(product);
                
                // Safe check for findItemInCart existence
                const isInCart = (product?.id && variant?.id && typeof findItemInCart === 'function') 
                  ? !!findItemInCart(product.id, variant.id) 
                  : false;
                
                const rawImage = product?.image_url || 
                                 product?.image || 
                                 product?.product_image || 
                                 product?.variation?.image || 
                                 product?.product_variation?.image ||
                                 product?.product_variation?.product?.image;

                return (
                  <motion.div 
                    key={productId} 
                    className="wishlist-card-luxe"
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="wishlist-visual-luxe">
                      <img
                        src={getImageUrl(rawImage)}
                        alt={product?.name || "Premium Asset"}
                        loading="lazy"
                        onError={(e) => { 
                            if (!e.target.src.includes('no-image')) {
                                e.target.src = getImageUrl(null); 
                            }
                        }}
                      />
                      {discount > 0 && (
                        <span className="wishlist-badge-luxe">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    <div className="wishlist-info-luxe">
                      <h3 className="wishlist-name-luxe">
                        {product?.name || "Unnamed Product"}
                      </h3>

                      <div className="wishlist-price-luxe">
                        <span className="price-current-luxe">
                          ₹{(Number(price) || 0).toFixed(0)}
                        </span>
                        {originalPrice > price && (
                          <span className="price-original-luxe">
                            ₹{(Number(originalPrice) || 0).toFixed(0)}
                          </span>
                        )}
                      </div>

                      <div className="wishlist-actions-luxe">
                        {isInCart ? (
                          <button className="btn-move-cart-luxe added-luxe">
                            <Check size={16} /> <span>ADDED</span>
                          </button>
                        ) : (
                          <button
                            className="btn-move-cart-luxe"
                            onClick={(e) => handleMoveToCart(e, product)}
                          >
                            <ShoppingCart size={16} /> <span>MOVE TO BAG</span>
                          </button>
                        )}

                        <button
                          className="btn-remove-luxe"
                          onClick={(e) => handleRemove(e, productId)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
