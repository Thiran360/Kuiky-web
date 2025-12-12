// src/pages/CartPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useCart } from "../../context/CartContext";
import { useAddress } from "../../context/AddressContext";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../api/config";
import "./cart.css";
import {
  Trash2, ShoppingBag, ArrowLeft, ShoppingCart,
  MapPin, ChevronRight, X
} from "lucide-react";

import AddressManager from "../Profile/AddressManager";


// ============= CART ITEM ==================
const CartItem = ({ item, onUpdateQuantity, onRemove, isProcessing }) => {
  const [localQty, setLocalQty] = useState(item.quantity);

  useEffect(() => setLocalQty(item.quantity), [item.quantity]);

  useEffect(() => {
    if (localQty === item.quantity || localQty < 1) return;
    const timer = setTimeout(() => onUpdateQuantity(item, localQty), 500);
    return () => clearTimeout(timer);
  }, [localQty, item, onUpdateQuantity]);

  const price = parseFloat(item.offer_price) || parseFloat(item.price) || 0;

  return (
    <div className="checkout-item">
      <div className="item-image">
        <img src={getImageUrl(item.image || item.image_url)} />
      </div>

      <div className="item-details">
        <h3>{item.product_name || item.name}</h3>
        {item.variant_value && <p className="variant-label">Variant: {item.variant_value}</p>}
        <p className="item-price">₹{price.toFixed(0)}</p>
      </div>

      <div className="item-actions">
        <div className="quantity-control">
          <button disabled={isProcessing} onClick={() => localQty > 1 ? setLocalQty(localQty - 1) : onRemove(item)}>−</button>
          <span className="quantity-value">{localQty}</span>
          <button disabled={isProcessing} onClick={() => setLocalQty(localQty + 1)}>+</button>
        </div>

        <div className="item-subtotal">₹{(price * localQty).toFixed(0)}</div>

        <button className="remove-item-btn" disabled={isProcessing} onClick={() => onRemove(item)}>
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};


// ============= ADDRESS MODAL ==================
const AddressModal = ({ onClose }) => {
  return (
    <div className="address-overlay-modal">
      <div className="address-modal-content">
        <div className="address-modal-header">
          <h2>Manage Shipping Addresses</h2>
          <button onClick={onClose} className="close-modal-btn">
            <X size={24} />
          </button>
        </div>

        <div className="address-modal-body">
          <AddressManager />
        </div>
      </div>
    </div>
  );
};


// ============= MAIN CART PAGE ==================
const CartPage = () => {
  const { cartItems, updateItemQuantity, removeFromCart, placeOrderFromCart } = useCart();
  const { selectedAddress, loadAddresses } = useAddress();

  const navigate = useNavigate();
  const [isManagingAddresses, setIsManagingAddresses] = useState(false);

  const defaultAddress = selectedAddress || null;


  // ============= QUANTITY UPDATE =============
  const handleQuantityUpdate = (item, qty) => {
    if (!item.cart_item_id) return;
    updateItemQuantity(item.cart_item_id, qty);
  };

  const handleRemoveItem = (item) => removeFromCart(item.cart_item_id);


  // ============= PLACE ORDER =============
  const handlePlaceOrder = async () => {
    if (!defaultAddress) {
      setIsManagingAddresses(true);
      return;
    }

    try {
      // ⭐ FIXED: Send correct payload structure
      const order = await placeOrderFromCart({
        address_id: defaultAddress.id
      });

      alert(`Order Placed! ID: ${order?.order_id}`);
      navigate("/orders");
    } catch (err) {
      alert("Order failed.");
    }
  };


  // ============= EMPTY CART UI =============
  if (!cartItems.length) {
    return (
      <div className="checkout-page">
        <div className="empty-checkout">
          <ShoppingBag size={80} />
          <h2>Your cart is empty</h2>
          <button className="btn-yellow-primary" onClick={() => navigate("/")}>
            <ArrowLeft size={18} /> Continue Shopping
          </button>
        </div>
      </div>
    );
  }


  // ============= CART TOTALS =============
  const { subtotal, shipping, tax, total } = useMemo(() => {
    const subtotal = cartItems.reduce((s, i) => {
      const price = parseFloat(i.offer_price) || parseFloat(i.price) || 0;
      return s + price * i.quantity;
    }, 0);

    const shipping = subtotal > 500 ? 0 : subtotal > 0 ? 40 : 0;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  }, [cartItems]);


  return (
    <div className="checkout-page">
      <div className="checkout-container">

        <div className="checkout-header">
          <h1>
            <ShoppingCart size={28} /> Your Cart
          </h1>
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div className="checkout-content">

          {/* LEFT SIDE */}
          <div className="checkout-items-section">

            {/* SHIPPING ADDRESS */}
            <div className="shipping-address-container">
              <div className="address-header">
                <MapPin size={20} /> Shipping To:
              </div>

              {defaultAddress ? (
                <div className="address-card-display">
                  <p className="address-name">{defaultAddress.full_name}</p>
                  <p>
                    {defaultAddress.address_line_1}, {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.postal_code}
                  </p>
                  <p className="address-phone">Phone: {defaultAddress.phone_number}</p>
                </div>
              ) : (
                <p>No address added.</p>
              )}

              <button className="manage-address-btn" onClick={() => setIsManagingAddresses(true)}>
                {defaultAddress ? "Change Address" : "Add Address"} <ChevronRight size={14} />
              </button>
            </div>


            {/* CART ITEMS */}
            <div className="checkout-items-list">
              {cartItems.map((item) => (
                <CartItem
                  key={item.cart_item_id}
                  item={item}
                  onUpdateQuantity={handleQuantityUpdate}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          </div>


          {/* RIGHT SIDE SUMMARY */}
          <div className="checkout-form-section">
            <h2>Order Summary</h2>

            <div className="price-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>

            <div className="price-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
            </div>

            <div className="price-row">
              <span>GST (18%)</span>
              <span>₹{tax.toFixed(0)}</span>
            </div>

            <div className="price-row total-row">
              <span>Total</span>
              <span>₹{total.toFixed(0)}</span>
            </div>

            <button
              className="btn-yellow-primary"
              disabled={!defaultAddress}
              onClick={handlePlaceOrder}
            >
              {defaultAddress ? `PLACE ORDER (₹${total.toFixed(0)})` : "ADD ADDRESS TO CONTINUE"}
            </button>
          </div>
        </div>
      </div>

      {isManagingAddresses && (
        <AddressModal
          onClose={() => {
            setIsManagingAddresses(false);
            loadAddresses();
          }}
        />
      )}
    </div>
  );
};

export default CartPage;
