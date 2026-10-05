import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useCart } from "../../context/CartContext";
import { useOrder } from "../../context/OrderContext";
import { useAddress } from "../../context/AddressContext";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../api/config";
import { useSmartImage } from "../../api/imageService";
import { motion, AnimatePresence } from "framer-motion";
import "./cart.css";

import { useUser } from "../../context/UserContext";
import {
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ShoppingCart,
  MapPin,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  PackageCheck,
  ShieldCheck,
  Zap,
  Edit2,
  Plus,
  Minus,
  ShieldAlert,
  Truck,
  Navigation,
  Globe,
  FileDown,
  Lock,
  UserPlus
} from "lucide-react";
import { generateInvoice } from "../../utils/invoiceGenerator";

import AddressManager from "../Profile/AddressManager";

/* ─── GUEST STATE (NOT LOGGED IN & EMPTY CART) ─── */
const GuestCartState = () => {
    const navigate = useNavigate();
    return (
        <div className="checkout-page guest-luxe-state">
            <motion.div 
                className="empty-luxe-card"
                initial={{ scale: 0.94, opacity: 0, y: 15 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
            >
                <div className="empty-luxe-visual">
                    <div className="empty-cart-icon-wrap">
                        <ShoppingBag size={46} className="text-emerald-500" />
                    </div>
                </div>
                <h2 className="empty-luxe-title">Your Basket is Empty</h2>
                <p className="empty-luxe-text">
                    Sign in to access your saved items, track your deliveries, and enjoy a faster checkout experience.
                </p>
                <div className="cart-empty-actions-col">
                    <button className="btn-primary-cart-action" onClick={() => navigate("/login")}>
                        <Zap size={18} /> Sign In to Your Account
                    </button>
                    <button className="btn-secondary-cart-action" onClick={() => navigate("/")}>
                        <ArrowLeft size={16} /> Continue Shopping as Guest
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

/* ─── HELPER: get the best price for a cart item ─── */
const getItemPrice = (item) => {
  const vId = item.product_variation_id || item.variation_id;
  const variations = item.product_variations || item.variations || item.product?.variations;

  if (vId && Array.isArray(variations)) {
    const v = variations.find(v => v.id === vId);
    if (v) {
      const p = parseFloat(v.offer_price ?? v.price);
      if (!isNaN(p) && p > 0) return Math.round(p);
    }
  }

  const prices = [
    item.offer_price, item.variation?.offer_price, item.product_variation?.offer_price,
    item.product?.offer_price, item.product?.min_offer_price,
    item.price, item.variation?.price, item.product_variation?.price,
    item.product?.price, item.product?.min_price,
  ];

  for (const p of prices) {
    if (p != null && p !== "null" && p !== "") {
      const parsed = parseFloat(p);
      if (!isNaN(parsed) && parsed > 0) return Math.round(parsed);
    }
  }
  return 0;
};

/* ─── CART ITEM ─── */
const CartItem = ({ item, onUpdateQuantity, onRemove, index }) => {
  const [localQty, setLocalQty] = useState(item.quantity || 1);
  const price = getItemPrice(item) || 0;

  useEffect(() => {
    if (localQty !== item.quantity && localQty > 0) {
      const t = setTimeout(() => onUpdateQuantity(item, localQty), 400);
      return () => clearTimeout(t);
    }
  }, [localQty]);

  return (
    <motion.div 
      className="luxe-checkout-item"
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <div className="luxe-item-visual">
        <CartItemImage item={item} name={item.product_name || item.name} />
      </div>

      <div className="luxe-item-info">
        <div className="luxe-header-group">
            <div className="luxe-title-wrapper">
                <h3 className="luxe-item-title">{item.product_name || item.name}</h3>
                {item.variant_value && (
                  <span className="luxe-variant-tag">{item.variant_value}</span>
                )}
            </div>
            <button className="luxe-remove-action" onClick={() => onRemove(item)} title="Remove item">
               <Trash2 size={18} />
            </button>
        </div>
        
        <div className="luxe-pricing-matrix">
            <div className="luxe-val-group">
                <span className="luxe-item-valuation">₹{price.toLocaleString()}</span>
            </div>

            <div className="luxe-calc-group">
                <div className="luxe-qty-terminal">
                   <button onClick={() => setLocalQty(q => (q > 1 ? q - 1 : q))}><Minus size={14} /></button>
                   <span className="qty-indicator">{localQty}</span>
                   <button onClick={() => setLocalQty(q => q + 1)}><Plus size={14} /></button>
                </div>
                <div className="luxe-item-net">₹{(price * localQty).toLocaleString()}</div>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── SUCCESS OVERLAY (ORDER PLACED) ─── */
const SuccessOverlay = ({ orderData }) => {
    const navigate = useNavigate();
    // Use the captured order data instead of the active (potentially empty) cart
    const items = orderData?.items || [];
    const address = orderData?.address || "SECURE STORE PICKUP";
    const orderId = useMemo(() => Math.random().toString(36).substr(2, 9).toUpperCase(), []);
    return (
        <motion.div 
            className="success-ecom360-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div 
                className="success-luxe-card"
                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 20 }}
            >
                <div className="success-luxe-visual">
                    <div className="luxe-pulse-ring"></div>
                    <div className="luxe-pulse-ring-slow"></div>
                    <CheckCircle2 size={100} strokeWidth={1} className="text-[#10b981]" />
                </div>

                <div className="success-luxe-content">
                    <span className="success-logistics-badge">LOGISTICS CONFIRMED</span>
                    <h2 className="success-luxe-title">Order Placed Successfully!</h2>
                    <p className="success-luxe-text">Your procurement request has been authorized and is being prepared for secure distribution.</p>
                    
                    <div className="success-id-dossier">
                        <span className="label">TRANSACTION AUTH ID</span>
                        <span className="value">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                    </div>

                    <div className="success-actions-ecom360">
                         <button onClick={() => navigate("/orders")} className="btn-success-primary">
                             VIEW ORDER HISTORY
                         </button>
                         <button 
                            onClick={() => {
                                // Simulate generating invoice for the current order
                                // In a real app, you'd have the order object from the backend response
                                generateInvoice({
                                    id: orderId,
                                    date: new Date(),
                                    items: items,
                                    address: address,
                                    total: items.reduce((s, i) => s + (getItemPrice(i) * i.quantity), 0)
                                });
                            }} 
                            className="btn-success-invoice"
                         >
                             <FileDown size={14} /> DOWNLOAD INVOICE
                         </button>
                    </div>

                    <div className="success-auto-redirect">
                        <div className="redirect-loader"></div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Automated Redirection to Dashboard in progress...</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

/* ─── LOGISTICS MODAL (CENTERED POPUP) ─── */
const LogisticsDrawer = ({ onClose }) => (
  <motion.div 
    className="logistics-slide-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div 
      className="logistics-drawer-content"
      initial={{ opacity: 0, scale: 0.94, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 15 }}
      transition={{ type: 'spring', damping: 25, stiffness: 320 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="drawer-institutional-header">
        <div className="header-meta">
            <span className="meta-badge">DELIVERY LOCATION</span>
            <h2>Select Delivery Address</h2>
        </div>
        <button onClick={onClose} className="drawer-close-btn" title="Close"><X size={20} /></button>
      </div>
      
      <div className="drawer-scroll-ecom360 no-scrollbar">
        <div className="drawer-info-block">
            <div className="info-icon"><Navigation size={18} /></div>
            <p>Select your delivery address or add a new address to continue checkout.</p>
        </div>
        
        <AddressManager />
      </div>

      <div className="drawer-institutional-footer">
         <ShieldCheck size={15} />
         <span>100% SECURE & ENCRYPTED CHECKOUT</span>
      </div>
    </motion.div>
  </motion.div>
);

/* ─── MAIN CART PAGE ─── */
const CartPage = () => {
  const { cartItems, updateItemQuantity, removeFromCart, placeOrderFromCart, clearCart } = useCart();
  const { fetchOrders } = useOrder();
  const { selectedAddress, loadAddresses, addresses } = useAddress();
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();

  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' -> 'shipping' -> 'payment'
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderData, setLastOrderData] = useState(null);
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [selectedBank, setSelectedBank] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvc: '' });
  const [upiVpa, setUpiVpa] = useState('');
  const [vpaVerified, setVpaVerified] = useState(false);

  const popularBanks = [
    { id: 'hdfc', name: 'HDFC Bank', icon: '🏦' },
    { id: 'icici', name: 'ICICI Bank', icon: '💎' },
    { id: 'sbi', name: 'State Bank of India', icon: '🏛️' },
    { id: 'axis', name: 'Axis Bank', icon: '⚡' },
    { id: 'kotak', name: 'Kotak Mahindra', icon: '🛡️' }
  ];

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((s, i) => s + getItemPrice(i) * i.quantity, 0);
    const shipping = 0; // 💎 ELITE ROYALE: COMPLIMENTARY LOGISTICS
    const tax = 0;      // 💎 ELITE ROYALE: TAX-EXEMPT PROCUREMENT
    return { subtotal, shipping, tax, total: subtotal + shipping + tax };
  }, [cartItems]);

  const getAddressLine = (addr) => addr?.address || addr?.address_line_1 || addr?.address_line1 || "";
  const getPincode = (addr) => addr?.pincode || addr?.postal_code || addr?.pin_code || "";
  const getPhone = (addr) => addr?.phone_number || addr?.mobile || addr?.mobile_number || "";

  const handlePlaceOrder = useCallback(async () => {
    setOrderError(null);
    
    if (!selectedAddress) {
      setCheckoutStep('shipping');
      setOrderError("Authentication of shipping address required.");
      return;
    }

    if (checkoutStep === 'payment' && !paymentMethod) {
      setOrderError("Selection of a premium funding source required.");
      return;
    }

    if (paymentMethod === 'netbanking' && !selectedBank) {
        setOrderError("Please select an authorized banking institution.");
        return;
    }

    if (cartItems.length === 0) return;

    setIsPlacingOrder(true);
    try {
      // High-fidelity institutional handshake
      console.log(`Initiating Final Settlement via: ${paymentMethod.toUpperCase()}`);
      
      await new Promise(r => setTimeout(r, 2800));
      
      // Capture order snapshot before clearing cart
      setLastOrderData({
        items: [...cartItems],
        address: selectedAddress
      });
      
      await placeOrderFromCart(selectedAddress);
      
      // 💎 ELITE SYNC: Background refresh of Order History
      if (typeof fetchOrders === 'function') {
        fetchOrders();
      }

      setOrderSuccess(true);
      
      // Auto-clear cart locally for supreme sync
      clearCart();
      
      setTimeout(() => navigate("/orders"), 4500);
    } catch (err) {
      console.error("Financial handshake failed:", err);
      setOrderError("Transaction Protocol Rejected: " + (err?.response?.data?.message || "Internal Bank Connectivity Fault"));
    } finally {
      setIsPlacingOrder(false);
    }
  }, [selectedAddress, paymentMethod, selectedBank, cartItems, checkoutStep, placeOrderFromCart, clearCart, navigate]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  // Show guest state only if guest AND cart is empty
  if (!isAuthenticated && (!cartItems || cartItems.length === 0)) {
      return <GuestCartState />;
  }

  // Show empty state if cart has no items
  if (!cartItems.length && !orderSuccess) {
    return (
      <div className="checkout-page empty-luxe-state">
        <motion.div 
            className="empty-luxe-card"
            initial={{ scale: 0.94, opacity: 0, y: 15 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="empty-luxe-visual">
             <div className="empty-cart-icon-wrap">
                <ShoppingBag size={46} className="text-slate-400" />
             </div>
          </div>
          <h2 className="empty-luxe-title">Your Basket is Empty</h2>
          <p className="empty-luxe-text">Looks like you haven't added anything to your cart yet. Explore our top products and find great deals today.</p>
          <div className="cart-empty-actions-col">
            <button className="btn-primary-cart-action" onClick={() => navigate("/")}>
               <ShoppingBag size={18} /> Start Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="checkout-page" onMouseMove={handleMouseMove}>
      <div className="radium-glow-overlay"></div>
      <div className="checkout-container">
        <motion.div 
          className="checkout-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>
            Shopping Bag
            <span className="item-count-badge">{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</span>
          </h1>
          <div className="header-actions-row">
            <button className="back-btn" onClick={() => navigate("/")}>
              <ArrowLeft size={16} /> Continue Shopping
            </button>
            <button className="empty-cart-btn" onClick={clearCart}>
              <Trash2 size={16} /> Clear Cart
            </button>
          </div>
        </motion.div>

        <div className="checkout-content">
          <div className="left-section">
            {/* STEP INDICATOR */}
            <div className="checkout-wizard-header">
              <div className={`wizard-step ${checkoutStep === 'cart' ? 'active' : 'completed'}`}>
                <div className="wizard-icon">
                  {checkoutStep === 'cart' ? <ShoppingBag size={20} /> : <CheckCircle2 size={20} />}
                </div>
                <div className="wizard-label">1. Cart</div>
              </div>
              <div className="wizard-line"></div>
              <div className={`wizard-step ${checkoutStep === 'shipping' ? 'active' : (checkoutStep === 'payment' ? 'completed' : 'pending')}`}>
                <div className="wizard-icon">
                  {checkoutStep === 'shipping' ? <MapPin size={20} /> : (checkoutStep === 'payment' ? <CheckCircle2 size={20} /> : "2")}
                </div>
                <div className="wizard-label">2. Delivery</div>
              </div>
              <div className="wizard-line"></div>
              <div className={`wizard-step ${checkoutStep === 'payment' ? 'active' : 'pending'}`}>
                <div className="wizard-icon">
                   <ShieldCheck size={20} />
                </div>
                <div className="wizard-label">3. Payment</div>
              </div>
            </div>

            {checkoutStep === 'cart' && (
              <div className="checkout-items-list">
                <AnimatePresence>
                  {cartItems.map((item, index) => (
                    <CartItem
                      key={item.cart_item_id || item.id}
                      item={item}
                      index={index}
                      onUpdateQuantity={(i, q) => updateItemQuantity(i.cart_item_id || i.id, q)}
                      onRemove={i => removeFromCart(i.cart_item_id || i.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {checkoutStep === 'shipping' && (
              <motion.div 
                className="shipping-address-container premium-selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="address-header-row-luxe">
                  <div className="address-header-luxe">
                    <div className="logistics-icon-wrapper">
                      <MapPin size={24} />
                    </div>
                    <h2>Delivery Address</h2>
                  </div>
                  <button className="manage-address-btn-luxe" onClick={() => setShowAddressModal(true)}>
                    {selectedAddress ? <><Edit2 size={15} /> Change Address</> : <><Plus size={15} /> Add Address</>}
                  </button>
                </div>

                {selectedAddress ? (
                  <div className="selected-address-ecom360">
                    <div className="ecom360-upper">
                        <div className="ecom360-status-pill">
                            <MapPin size={11} />
                            <span>DELIVERY LOCATION</span>
                        </div>
                        <div className="ecom360-verification-shield">
                            <CheckCircle2 size={24} className="text-emerald-500" strokeWidth={2} />
                        </div>
                    </div>

                    <div className="ecom360-body">
                        <div className="ecom360-identity-group">
                            <h4 className="ecom360-name">{selectedAddress.full_name || selectedAddress.name}</h4>
                            <p className="ecom360-location-summary">{selectedAddress.city}, {selectedAddress.state}</p>
                        </div>
                        
                        <div className="ecom360-address-details">
                            <p className="ecom360-street">{getAddressLine(selectedAddress)}</p>
                            <p className="ecom360-pincode">PIN: {getPincode(selectedAddress)}</p>
                        </div>

                        <div className="ecom360-comms-terminal">
                            <div className="ecom360-phone-display">
                                <span className="text-[11px] text-slate-400 font-semibold">Phone:</span>
                                <span className="font-semibold text-slate-800">{getPhone(selectedAddress)}</span>
                            </div>
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-address-warning-large" onClick={() => setShowAddressModal(true)}>
                    <div className="icon-pulse"><MapPin size={36} /></div>
                    <h3>Where should we deliver?</h3>
                    <p>Select or add a delivery address to complete your order.</p>
                    <button className="inline-add-btn">Add Delivery Address</button>
                  </div>
                )}
              </motion.div>
            )}

            {checkoutStep === 'payment' && (
              <motion.div 
                className="payment-portal-premium"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="payment-header">
                  <PackageCheck size={24} className="text-emerald-500" /> Select Payment Method
                </div>

                <div className="payment-methods-grid">
                  <div 
                    className={`payment-method-card-premium ${paymentMethod === 'card' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className="method-visual">
                       <div className="luxe-radio-ring"></div>
                    </div>
                    <div className="method-details-luxe">
                      <h3>Credit / Debit Card</h3>
                      <p>Visa, Mastercard, RuPay</p>
                    </div>
                  </div>

                  <div 
                    className={`payment-method-card-premium ${paymentMethod === 'upi' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <div className="method-visual">
                       <div className="luxe-radio-ring"></div>
                    </div>
                    <div className="method-details-luxe">
                      <h3>UPI</h3>
                      <p>Google Pay, PhonePe, Paytm, QR</p>
                    </div>
                  </div>

                  <div 
                    className={`payment-method-card-premium ${paymentMethod === 'netbanking' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('netbanking')}
                  >
                    <div className="method-visual">
                       <div className="luxe-radio-ring"></div>
                    </div>
                    <div className="method-details-luxe">
                      <h3>Net Banking</h3>
                      <p>All major Indian banks</p>
                    </div>
                  </div>

                  <div 
                    className={`payment-method-card-premium ${paymentMethod === 'cod' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className="method-visual">
                       <div className="luxe-radio-ring"></div>
                    </div>
                    <div className="method-details-luxe">
                      <h3>Cash on Delivery (COD)</h3>
                      <p>Pay with cash at your doorstep</p>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <motion.div className="card-input-complex" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="luxury-card-preview">
                       <div className="card-logo-placeholder">
                         {cardDetails.number?.startsWith('4') ? 'VISA' : 
                          cardDetails.number?.startsWith('5') ? 'MASTERCARD' : 'PLATINUM'}
                       </div>
                       <p className="chip"></p>
                       <p className="number">{cardDetails.number || "**** **** **** ****"}</p>
                       <div className="card-bottom">
                         <span className="owner">{cardDetails.name || "CARDHOLDER NAME"}</span>
                         <div className="expiry-group">
                            <span className="expiry-label">VALID THRU</span>
                            <span className="expiry">{cardDetails.expiry || "MM/YY"}</span>
                         </div>
                       </div>
                    </div>
                    <div className="card-form">
                      <input 
                        placeholder="Card Number" 
                        maxLength={19}
                        value={cardDetails.number || ""}
                        onChange={(e) => {
                           let val = e.target.value.replace(/\D/g, ''); 
                           val = val.replace(/(\d{4})/g, '$1 ').trim(); 
                           setCardDetails({...cardDetails, number: val});
                        }}
                      />
                      <input 
                        placeholder="Cardholder Name" 
                        value={cardDetails.name || ""}
                        onChange={(e) => {
                           const val = e.target.value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
                           setCardDetails({...cardDetails, name: val});
                        }}
                      />
                      <div className="form-row">
                        <input 
                            placeholder="MM/YY" 
                            maxLength={5} 
                            value={cardDetails.expiry || ""}
                            onChange={(e) => {
                               let val = e.target.value.replace(/\D/g, '');
                               if (val.length >= 2) {
                                   val = val.substring(0,2) + '/' + val.substring(2,4);
                               }
                               setCardDetails({...cardDetails, expiry: val});
                            }} 
                        />
                        <input 
                            placeholder="CVC" 
                            maxLength={3} 
                            type="password" 
                            value={cardDetails.cvc || ""}
                            onChange={(e) => {
                               const val = e.target.value.replace(/\D/g, '');
                               setCardDetails({...cardDetails, cvc: val});
                            }} 
                         />
                      </div>
                    </div>
                  </motion.div>
                )}

                {paymentMethod === 'netbanking' && (
                  <motion.div className="net-banking-portal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bank-selection-header">Choose Your Premier Bank</div>
                    <div className="popular-banks-grid">
                      {popularBanks.map(bank => (
                        <div 
                          key={bank.id} 
                          className={`bank-option ${selectedBank === bank.id ? 'active' : ''}`}
                          onClick={() => setSelectedBank(bank.id)}
                        >
                          <span className="bank-icon">{bank.icon}</span>
                          <span className="bank-name">{bank.name}</span>
                        </div>
                      ))}
                    </div>
                    <select className="full-bank-select" value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}>
                      <option value="">Other Authorized Institutions</option>
                      <option value="yes">Yes Bank</option>
                      <option value="canara">Canara Bank</option>
                      <option value="pnb">Punjab National Bank</option>
                    </select>
                  </motion.div>
                )}

                {paymentMethod === 'upi' && (
                  <motion.div className="upi-portal-display" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="luxe-qr-nexus">
                        <div className="qr-visual-placeholder"></div>
                        <div className="qr-scan-line"></div>
                    </div>
                    
                    <div className="merchant-verified-row">
                        <CheckCircle2 size={12} className="text-[#10b981]" />
                        <span>Authorized Merchant • Security Tier 1</span>
                    </div>

                    <div className="upi-id-suggestions">
                        {['@okaxis', '@okicici', '@upi', '@ybl'].map(handle => (
                            <span 
                                key={handle} 
                                className={`handle-chip ${upiVpa.includes(handle) ? 'active' : ''}`}
                                onClick={() => {
                                    const base = upiVpa.split('@')[0] || 'user';
                                    setUpiVpa(base + handle);
                                    setVpaVerified(false);
                                }}
                            >
                                {handle}
                            </span>
                        ))}
                    </div>

                    <div className="upi-vpa-row-premium">
                        <input 
                            className={`upi-input-elite ${vpaVerified ? 'border-green-500 bg-green-50' : ''}`}
                            placeholder="Enter VPA ID (e.g. user@bank)" 
                            value={upiVpa}
                            onChange={(e) => {
                                setUpiVpa(e.target.value);
                                setVpaVerified(false);
                            }}
                        />
                        <button 
                            className={`vpa-verify-btn-elite ${vpaVerified ? 'bg-green-600' : ''}`} 
                            onClick={(e) => {
                                e.preventDefault();
                                if(!upiVpa) return;
                                setVpaVerified(true);
                            }}
                        >
                            {vpaVerified ? 'VERIFIED' : 'VALIDATE'}
                        </button>
                    </div>
                  </motion.div>
                )}

                {paymentMethod === 'cod' && (
                  <motion.div className="cod-portal-premium" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="cod-security-header">
                        <ShieldAlert size={16} />
                        <span>High-Value Identity Protocol Active</span>
                    </div>
                    
                    <div className="cod-instruction-box">
                        <div className="flex justify-center mb-3">
                            <Truck size={40} className="text-slate-800" />
                        </div>
                        <h4>Post-Delivery Settlement</h4>
                        <p>Our courier will verify the package upon arrival.</p>
                    </div>

                    <div className="cod-otp-simulation">
                        <span className="cod-otp-label">Recipient Verification Token</span>
                        <div className="cod-otp-inputs">
                            {[1, 2, 3, 4].map(i => <div key={i} className="cod-otp-digit">•</div>)}
                        </div>
                    </div>

                    <div className="cod-notice-badge">
                        <CheckCircle2 size={10} />
                        <span>Standard verification fees waived for your tier</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          <motion.div 
            className="checkout-form-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2>Order Summary</h2>

            <div className="price-row">
              <span className="row-label-luxe">Items Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
              <span className="row-value-luxe">₹{totals.subtotal.toLocaleString()}</span>
            </div>

            <div className="price-row">
              <span className="row-label-luxe">Delivery Fee</span>
              <span className={totals.shipping === 0 ? "row-value-luxe text-emerald-600 font-semibold" : "row-value-luxe"}>
                {totals.shipping === 0 ? "FREE" : `₹${totals.shipping}`}
              </span>
            </div>

            <div className="price-row">
              <span className="row-label-luxe">Estimated Tax (GST)</span>
              <span className="row-value-luxe text-slate-400">₹0</span>
            </div>

            <div className="price-row total-row-premium">
              <span className="total-label-luxe">Total Amount</span>
              <span className="total-value-luxe">₹{totals.total.toLocaleString()}</span>
            </div>

            <div className="security-nexus-badge">
               <ShieldCheck size={15} />
               <span>100% Safe & Secure Checkout</span>
            </div>

            {orderError && (
              <div className="order-error-banner">
                <AlertCircle size={18} />
                <span>{orderError}</span>
              </div>
            )}

            <button
              className={`btn-elite-deployment ${
                (isPlacingOrder || 
                 (isAuthenticated && checkoutStep === 'shipping' && !selectedAddress) || 
                 (isAuthenticated && checkoutStep === 'payment' && (!selectedAddress || !paymentMethod))
                ) ? "btn-locked" : ""
              }`}
              onClick={() => {
                if (!isAuthenticated) {
                  navigate("/login", { state: { from: "/cart" } });
                  return;
                }
                if (checkoutStep === 'cart') setCheckoutStep('shipping');
                else if (checkoutStep === 'shipping') setCheckoutStep('payment');
                else handlePlaceOrder();
              }}
              disabled={isPlacingOrder}
            >
              <div className="btn-glow-container">
                {isPlacingOrder ? (
                  <><Loader2 size={20} className="spin-icon" /> Processing Order...</>
                ) : (
                  <>
                    <span>
                      {!isAuthenticated ? 'Sign In to Checkout' :
                       checkoutStep === 'cart' ? 'Proceed to Checkout' :
                       checkoutStep === 'shipping' ? 'Continue to Payment' :
                       'Place Order'}
                    </span>
                    <div className="btn-icon-pulse">
                      {!isAuthenticated ? <Zap size={18} /> : checkoutStep === 'payment' ? <ShieldCheck size={18} /> : <ChevronRight size={18} />}
                    </div>
                  </>
                )}
              </div>
            </button>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showAddressModal && (
          <LogisticsDrawer
            onClose={() => {
              setShowAddressModal(false);
              loadAddresses();
              setOrderError(null);
              if (selectedAddress) setCheckoutStep('payment');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {orderSuccess && <SuccessOverlay orderData={lastOrderData} />}
      </AnimatePresence>
    </div>
  );
};

/** Helper component for cart item image */
const CartItemImage = ({ item, name }) => {
  // 💎 ELITE ROYALE IMAGE DISCOVERY: Sequential fallback through all known backend schemas
  const rawUrl = item?.image_url || 
                 item?.image || 
                 item?.product_image || 
                 item?.product?.image_url || 
                 item?.product?.image || 
                 item?.variation?.image || 
                 item?.product_variation?.image ||
                 item?.product_variation?.product?.image;

  const { src } = useSmartImage(rawUrl);

  return (
    <img
      src={src}
      className="luxe-item-img-element"
      alt={name || "Elite Royale Asset"}
      loading="lazy"
      onError={(e) => { 
        if (!e.target.src.includes('no-image')) {
          e.target.src = getImageUrl(null); 
        }
      }}
    />
  );
};

export default CartPage;
