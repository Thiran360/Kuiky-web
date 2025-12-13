import React, { useEffect } from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../api/config";
import { Trash2, ShoppingCart, Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Wishlist.css";
import { wishlistService } from "../api/wishlistService";

const Wishlist = () => {
  const { wishlist, loading, loadWishlist, removeItemLocally } = useWishlist();
  const { addItemToCart, refreshCart, findItemInCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const getProduct = (item) => item.product || item;

  const getProductId = (item) => {
    const p = getProduct(item);
    return item?.product_id || p?.product_id || p?.id || null;
  };

  const getVariantForCart = (product) => {
    if (!product) return null;
    if (product.default_variant) return product.default_variant;
    if (product.variations?.length) return product.variations[0];
    return null;
  };

  const getWishlistPrice = (product) => {
    const variant = getVariantForCart(product);
    if (variant?.price != null) return Number(variant.price);
    if (product?.offer_price != null) return Number(product.offer_price);
    if (product?.selling_price != null) return Number(product.selling_price);
    if (product?.price != null) return Number(product.price);
    return 0;
  };

  const handleRemove = async (e, productId) => {
    e.stopPropagation();
    try {
      await wishlistService.removeFromWishlist(productId);
      removeItemLocally(productId);
    } catch {
      alert("Failed to remove item");
    }
  };

  const handleMoveToCart = async (e, product) => {
    e.stopPropagation();
    const variant = getVariantForCart(product);
    if (!variant?.id) return alert("Product not available");

    if (findItemInCart(variant.id)) {
      await refreshCart();
      return;
    }

    await addItemToCart(variant.id, 1);
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <button className="wishlist-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="wishlist-title">
            My Wishlist ({wishlist.length})
          </h1>
        </div>

        {loading && <p className="wishlist-loading">Loading...</p>}

        {!loading && wishlist.length === 0 && (
          <div className="wishlist-empty">
            <p>You haven't saved any items yet.</p>
            <button
              className="wishlist-empty-btn"
              onClick={() => navigate("/")}
            >
              Start Shopping
            </button>
          </div>
        )}

        {!loading && wishlist.length > 0 && (
          <div className="wishlist-grid">
            {wishlist.map((item) => {
              const product = getProduct(item);
              const productId = getProductId(item);
              if (!productId) return null;

              const price = getWishlistPrice(product);
              const originalPrice =
                product?.price != null ? Number(product.price) : price;

              const discount =
                originalPrice > price
                  ? Math.round(
                      ((originalPrice - price) / originalPrice) * 100
                    )
                  : 0;

              const variant = getVariantForCart(product);
              const isInCart = variant?.id
                ? !!findItemInCart(variant.id)
                : false;

              const image =
                product?.image ||
                product?.image_url ||
                product?.product_image;

              return (
                <div key={productId} className="wishlist-card">
                  <div className="wishlist-image-wrapper">
                    <img
                      src={getImageUrl(image)}
                      alt={product?.name}
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/200")
                      }
                    />
                    {discount > 0 && (
                      <span className="wishlist-discount-badge">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  <div className="wishlist-info">
                    <h3 className="wishlist-product-name">
                      {product?.name || "Unnamed Product"}
                    </h3>

                    <div className="wishlist-price-section">
                      <span className="wishlist-current-price">
                        ₹{price.toFixed(0)}
                      </span>
                      {originalPrice > price && (
                        <span className="wishlist-original-price">
                          ₹{originalPrice.toFixed(0)}
                        </span>
                      )}
                    </div>

                    <div className="wishlist-actions">
                      {isInCart ? (
                        <button className="wishlist-move-to-cart added-state">
                          <Check size={14} /> Added
                        </button>
                      ) : (
                        <button
                          className="wishlist-move-to-cart"
                          onClick={(e) =>
                            handleMoveToCart(e, product)
                          }
                        >
                          <ShoppingCart size={14} /> Move to Cart
                        </button>
                      )}

                      <button
                        className="wishlist-remove-btn"
                        onClick={(e) =>
                          handleRemove(e, productId)
                        }
                      >
                        <Trash2 size={14} /> Remove
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
