import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "../../context/CartContext";
import { useAddress } from "../../context/AddressContext";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../api/config";
import "./cart.css";

import {
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ShoppingCart,
  MapPin,
  ChevronRight,
  X,
} from "lucide-react";

import AddressManager from "../Profile/AddressManager";

/* ================= CART ITEM ================= */
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [localQty, setLocalQty] = useState(item.quantity);
  const price = parseFloat(item.offer_price) || parseFloat(item.price) || 0;

  useEffect(() => {
    if (localQty !== item.quantity && localQty > 0) {
      const t = setTimeout(() => onUpdateQuantity(item, localQty), 400);
      return () => clearTimeout(t);
    }
  }, [localQty]);

  return (
    <div className="checkout-item">
      {/* IMAGE */}
      <div className="item-image">
        <img src={getImageUrl(item.image || item.image_url)} alt={item.name} />
      </div>

      {/* DETAILS */}
      <div className="item-details">
        <h3>{item.product_name || item.name}</h3>

        <p className="item-price">₹{price.toFixed(0)}</p>

        {/* QUANTITY UNDER NAME (LEFT) */}
        <div className="quantity-control left">
          <button onClick={() => setLocalQty(q => (q > 1 ? q - 1 : q))}>−</button>
          <span>{localQty}</span>
          <button onClick={() => setLocalQty(q => q + 1)}>+</button>
        </div>

        {item.variant_value && (
          <span className="variant-label">Variant: {item.variant_value}</span>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="item-actions">
        <div className="item-subtotal">
          ₹{(price * localQty).toFixed(0)}
        </div>

        <button className="remove-item-btn" onClick={() => onRemove(item)}>
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

/* ================= ADDRESS MODAL ================= */
const AddressModal = ({ onClose }) => (
  <div className="address-overlay-modal">
    <div className="address-modal-content">
      <div className="address-modal-header">
        <h2>Manage Shipping Addresses</h2>
        <button onClick={onClose} className="close-modal-btn">
          <X size={22} />
        </button>
      </div>
      <div className="address-modal-body">
        <AddressManager />
      </div>
    </div>
  </div>
);

/* ================= MAIN PAGE ================= */
const CartPage = () => {
  const { cartItems, updateItemQuantity, removeFromCart, placeOrderFromCart } =
    useCart();
  const { selectedAddress, loadAddresses } = useAddress();

  const navigate = useNavigate();
  const [showAddressModal, setShowAddressModal] = useState(false);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((s, i) => {
      const p = parseFloat(i.offer_price) || parseFloat(i.price) || 0;
      return s + p * i.quantity;
    }, 0);
    const shipping = subtotal > 500 ? 0 : subtotal ? 40 : 0;
    return { subtotal, shipping, total: subtotal + shipping };
  }, [cartItems]);

  if (!cartItems.length) {
    return (
      <div className="checkout-page empty">
        <ShoppingBag size={80} />
        <h2>Your cart is empty</h2>
        <button className="btn-yellow-primary" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* HEADER */}
        <div className="checkout-header">
          <h1>
            <ShoppingCart size={26} /> Your Cart
          </h1>
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div className="checkout-content">
          {/* LEFT */}
          <div>
            {/* ADDRESS */}
            <div className="shipping-address-container">
              <div className="address-header-row">
                <div className="address-header">
                  <MapPin size={18} /> Shipping To
                </div>

                <button
                  className="manage-address-btn"
                  onClick={() => setShowAddressModal(true)}
                >
                  Change Address <ChevronRight size={14} />
                </button>
              </div>

              {selectedAddress && (
                <>
                  <p className="address-name">{selectedAddress.full_name}</p>
                  <p>
                    {selectedAddress.address_line_1},{" "}
                    {selectedAddress.city},{" "}
                    {selectedAddress.state} -{" "}
                    {selectedAddress.postal_code}
                  </p>
                  <p className="address-phone">
                    Phone: {selectedAddress.phone_number}
                  </p>
                </>
              )}
            </div>

            {/* ITEMS */}
            <div className="checkout-items-list">
              {cartItems.map(item => (
                <CartItem
                  key={item.cart_item_id}
                  item={item}
                  onUpdateQuantity={(i, q) =>
                    updateItemQuantity(i.cart_item_id, q)
                  }
                  onRemove={i => removeFromCart(i.cart_item_id)}
                />
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="checkout-form-section">
            <h2>Order Summary</h2>

            <div className="price-row">
              <span>Subtotal</span>
              <span>₹{totals.subtotal}</span>
            </div>

            <div className="price-row">
              <span>Shipping</span>
              <span>{totals.shipping ? `₹${totals.shipping}` : "FREE"}</span>
            </div>

            <div className="price-row total-row">
              <span>Total</span>
              <span>₹{totals.total}</span>
            </div>

            <button
              className="btn-yellow-primary"
              onClick={() =>
                placeOrderFromCart({ address_id: selectedAddress.id })
              }
            >
              PLACE ORDER (₹{totals.total})
            </button>
          </div>
        </div>
      </div>

      {showAddressModal && (
        <AddressModal
          onClose={() => {
            setShowAddressModal(false);
            loadAddresses();
          }}
        />
      )}
    </div>
  );
};

export default CartPage;
