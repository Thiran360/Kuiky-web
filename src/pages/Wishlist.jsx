// src/pages/Wishlist.jsx

import React, { useEffect, useState } from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../api/config";
import { Trash2, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import "./Wishlist.css";
import { wishlistService } from "../api/wishlistService";

const Wishlist = () => {
  const { wishlist, loading, loadWishlist, removeItemLocally } = useWishlist();
  const { addItemToCart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [addedToCart, setAddedToCart] = useState({});

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const getProduct = (item) => item.product || item;

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

  // REMOVE
  const handleRemove = async (e, productId) => {
    if (e) e.stopPropagation();
    if (!productId) return;

    try {
      // Uses DELETE /wishlist/remove/ with body { product_id }
      await wishlistService.removeFromWishlist(productId);
      removeItemLocally(productId);
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      // Stop telling the user "login again" every time; just show generic error.
      alert("Failed to remove item from wishlist. Please try again.");
    }
  };

  // ADD → CART
  const handleMoveToCart = async (e, productId, product) => {
    e.stopPropagation();
    if (!productId) return;

    try {
      // If no variant, fall back to productId
      const variantId =
        product?.default_variant_id ||
        product?.variations?.[0]?.id ||
        productId;

      await addItemToCart(variantId, 1);
      await refreshCart();

      setAddedToCart((prev) => ({ ...prev, [productId]: true }));
    } catch (err) {
      console.error("Move to cart failed:", err);
      alert("Failed to move item to cart.");
    }
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <h1 className="wishlist-title">My Wishlist</h1>

        {loading && <div className="wishlist-loading">Loading...</div>}

        {!loading && wishlist.length === 0 && (
          <div className="wishlist-empty">
            <p>Your wishlist is empty.</p>
            <button className="wishlist-empty-btn" onClick={() => navigate("/")}>
              Shop Now
            </button>
          </div>
        )}

        {!loading && wishlist.length > 0 && (
          <div className="wishlist-grid">
            {wishlist.map((item) => {
              const product = getProduct(item);
              const productId = getProductId(item);

              if (!productId) return null;

              const name =
                product?.name || product?.product_name || "Unnamed";
              const price =
                product?.offer_price ||
                product?.selling_price ||
                product?.price ||
                0;

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
                    />
                  </div>

                  <div className="wishlist-info">
                    <h2 className="wishlist-product-name">{name}</h2>

                    <div className="wishlist-price-row">
                      <span className="wishlist-price">
                        ₹{Number(price).toFixed(2)}
                      </span>
                    </div>

                    <div className="wishlist-actions">
                      {addedToCart[productId] ? (
                        <button
                          className="wishlist-move-to-cart added"
                          disabled
                        >
                          ✔ Added
                        </button>
                      ) : (
                        <button
                          className="wishlist-move-to-cart"
                          onClick={(e) =>
                            handleMoveToCart(e, productId, product)
                          }
                        >
                          <ShoppingCart size={18} />
                          <span>Add to Cart</span>
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
