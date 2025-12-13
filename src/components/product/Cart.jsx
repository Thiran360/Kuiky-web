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

// ============= CART ITEM (Defensive Changes Added) ==================
const CartItem = ({ item, onUpdateQuantity, onRemove, isProcessing }) => {
    const [localQty, setLocalQty] = useState(item.quantity);

    // --- Price and ID extraction (Added defensive checks) ---
    const price = parseFloat(item.offer_price) || parseFloat(item.price) || 0;
    
    // Crucial: Use the product variant ID as a fallback if cart_item_id is missing, 
    // but log a warning as cart_item_id is preferred for updates/removals.
    const uniqueItemId = item.cart_item_id || item.product_variant_id || item.product_id;
    
    if (!uniqueItemId) {
        console.error("CartItem missing unique ID for rendering/actions:", item);
        return null; 
    }

    useEffect(() => setLocalQty(item.quantity), [item.quantity]);

    useEffect(() => {
        if (localQty === item.quantity || localQty < 1) return;
        
        // Ensure we pass the unique API identifier
        const timer = setTimeout(() => onUpdateQuantity(item, localQty), 500);
        return () => clearTimeout(timer);
    }, [localQty, item, onUpdateQuantity]);


    return (
        <div className="checkout-item">
            <div className="item-image">
                <img 
                    src={getImageUrl(item.image || item.image_url)} 
                    alt={item.product_name || item.name}
                    onError={(e) => e.target.src = "https://via.placeholder.com/80?text=No+Image"}
                />
            </div>

            <div className="item-details">
                <h3>{item.product_name || item.name || "Unknown Product"}</h3>
                {item.variant_value && <p className="variant-label">Variant: {item.variant_value}</p>}
                <p className="item-price">₹{price.toFixed(0)}</p>
            </div>

            <div className="item-actions">
                <div className="quantity-control">
                    <button 
                        disabled={isProcessing} 
                        onClick={() => localQty > 1 ? setLocalQty(localQty - 1) : onRemove(item)}
                    >
                        —
                    </button>
                    <span className="quantity-value">{localQty}</span>
                    <button 
                        disabled={isProcessing} 
                        onClick={() => setLocalQty(localQty + 1)}
                    >
                        +
                    </button>
                </div>

                <div className="item-subtotal">₹{(price * localQty).toFixed(0)}</div>

    try {
      // Ensure payload matches backend expectations (address_id is correct)
      const order = await placeOrderFromCart({
        address_id: defaultAddress.id
      });

      alert(`Order Placed! ID: ${order?.order_id}`);
      navigate("/orders");
    } catch (err) {
      console.error("Order failed:", err);
      alert("Order failed.");
    }
  };

//   const handlePlaceOrder = async () => {
//     if (!defaultAddress) {
//         // Still check if an address is selected, but this time to extract data
//         setIsManagingAddresses(true);
//         return;
//     }

//     try {
//         // Construct the address data payload required for the direct order endpoint
//         const addressDataPayload = {
//             address: defaultAddress.address,
//             pincode: defaultAddress.pincode,
//             latitude: defaultAddress.latitude,
//             longitude: defaultAddress.longitude,
//         };
        
//         // Use the new context function
//         const order = await placeOrderDirectly(addressDataPayload); 

//         alert(`Order Placed! ID: ${order?.order_id}`);
//         navigate("/orders");
//     } catch (err) {
//         console.error("Order failed:", err);
//         alert(`Order failed: ${err.message || 'Unknown error'}`);
//     }
// };

  // ============= EMPTY CART UI (Conditional Return) =============
  // This MUST come after all hooks are called.
  if (!cartItems.length) {
  return (
    <div className="checkout-page">
      <div className="empty-checkout">
        <ShoppingBag size={80} />
        <h2>Your cart is empty</h2>

        <button
          className="btn-yellow-primary"
          onClick={() => navigate("/")}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}


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


// ============= ADDRESS MODAL (Unchanged) ==================
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


    // ============= CART TOTALS =============
    const { subtotal, shipping, total } = useMemo(() => {
        const subtotal = cartItems.reduce((s, i) => {
            const price = parseFloat(i.offer_price) || parseFloat(i.price) || 0;
            return s + price * (i.quantity || 0); // Use 0 if quantity is undefined
        }, 0);

        const shipping = subtotal > 500 ? 0 : subtotal > 0 ? 40 : 0;
        // Tax calculation commented out, using only subtotal + shipping for total
        const total = subtotal + shipping; 

        return { subtotal, shipping, total };
    }, [cartItems]);
    // ============= END CART TOTALS =============


    // ============= QUANTITY UPDATE HANDLERS =============
    const handleQuantityUpdate = (item, qty) => {
        // Use cart_item_id as the primary identifier for API update
        const idToUpdate = item.cart_item_id; 
        if (!idToUpdate) {
            console.error("Cannot update quantity: cart_item_id missing.");
            return;
        }
        updateItemQuantity(idToUpdate, qty);
    };

    const handleRemoveItem = (item) => {
        const idToRemove = item.cart_item_id;
        if (!idToRemove) {
            console.error("Cannot remove item: cart_item_id missing.");
            return;
        }
        removeFromCart(idToRemove);
    };


    // ============= PLACE ORDER =============
    const handlePlaceOrder = async () => {
        if (!defaultAddress) {
            setIsManagingAddresses(true);
            return;
        }

        try {
            const order = await placeOrderFromCart({
                address_id: defaultAddress.id
            });

            alert(`Order Placed! ID: ${order?.order_id || 'Unknown'}`);
            navigate("/orders");
        } catch (err) {
            console.error("Order failed:", err);
            alert(`Order failed. Error: ${err.message || 'Unknown error'}`);
        }
    };


    // ============= EMPTY CART UI (Conditional Return) =============
    if (!cartItems || cartItems.length === 0) {
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

                    {/* LEFT SIDE: ITEMS & ADDRESS */}
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
                                <p className="address-warning">Please add or select a delivery address to proceed.</p>
                            )}

                            <button className="manage-address-btn" onClick={() => setIsManagingAddresses(true)}>
                                {defaultAddress ? "Change Address" : "Add Address"} <ChevronRight size={14} />
                            </button>
                        </div>


                        {/* CART ITEMS LIST */}
                        <div className="checkout-items-list">
                            {cartItems.map((item) => (
                                // Use item.id as a fallback key if cart_item_id is not guaranteed
                                <CartItem
                                    key={item.cart_item_id || item.id} 
                                    item={item}
                                    onUpdateQuantity={handleQuantityUpdate}
                                    onRemove={handleRemoveItem}
                                />
                            ))}
                        </div>
                    </div>


                    {/* RIGHT SIDE: SUMMARY */}
                    <div className="checkout-form-section">
                        <h2>Order Summary</h2>

                        <div className="price-row">
                            <span>Subtotal ({cartItems.length} items)</span>
                            <span>₹{subtotal.toFixed(0)}</span>
                        </div>

                        <div className="price-row">
                            <span>Shipping Fee</span>
                            <span className={shipping === 0 ? "free-shipping" : ""}>
                                {shipping === 0 ? "FREE" : `₹${shipping.toFixed(0)}`}
                            </span>
                        </div>

                        {/* Total row */}
                        <div className="price-row total-row">
                            <span>Total Payable</span>
                            <span>₹{total.toFixed(0)}</span>
                        </div>
                        
                        {/* Action Button */}
                        <button
                            className="place-order-btn"
                            disabled={!defaultAddress || total <= 0}
                            onClick={handlePlaceOrder}
                        >
                            {defaultAddress ? 
                                `PLACE ORDER (₹${total.toFixed(0)})` : 
                                "ADD ADDRESS TO CONTINUE"
                            }
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