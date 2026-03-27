import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useCart } from "../../context/CartContext";
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

/* ─── GUEST STATE (NOT LOGGED IN) ─── */
const GuestCartState = () => {
    const navigate = useNavigate();
    return (
        <div className="checkout-page guest-luxe-state">
            <motion.div 
                className="empty-luxe-card"
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
            >
                <div className="empty-luxe-visual">
                    <Lock size={80} strokeWidth={1} className="text-amber-200" />
                    <div className="empty-glow-amber"></div>
                </div>
                <h2 className="empty-luxe-title">Cart Synchronicity Limited</h2>
                <p className="empty-luxe-text">
                    Your shopping bag is waiting to be filled. Sign in to your account to sync items across your devices 
                    and access our secure elite procurement protocol.
                </p>
                <div className="flex flex-col gap-4 items-center">
                    <button className="btn-elite-deployment m-0 w-auto px-12" onClick={() => navigate("/login")}>
                        <Zap size={18} /> SIGN IN TO YOUR ACCOUNT
                    </button>
                    <button className="text-slate-400 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors" onClick={() => navigate("/")}>
                        OR BROWSE AS GUEST
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
        <CartItemImage url={item.image || item.image_url} name={item.product_name || item.name} />
        <div className="luxe-item-badge">PREMIUM</div>
      </div>

      <div className="luxe-item-info">
        <div className="luxe-header-group">
            <div className="luxe-title-wrapper">
                <span className="luxe-item-serial">ITEM 0{index + 1}</span>
                <h3 className="luxe-item-title">{item.product_name || item.name}</h3>
            </div>
            <button className="luxe-remove-action" onClick={() => onRemove(item)}>
               <Trash2 size={16} />
            </button>
        </div>
        
        <div className="luxe-pricing-matrix">
            <div className="luxe-val-group">
                <p className="luxe-item-valuation">₹{price.toFixed(0)}</p>
                <span className="valuation-label">CERTIFIED UNIT PRICE</span>
            </div>

            <div className="luxe-calc-group">
                <div className="luxe-qty-terminal">
                   <button onClick={() => setLocalQty(q => (q > 1 ? q - 1 : q))}><Minus size={14} /></button>
                   <span className="qty-indicator">{localQty}</span>
                   <button onClick={() => setLocalQty(q => q + 1)}><Plus size={14} /></button>
                </div>
                <div className="luxe-item-net">₹{(price * localQty).toFixed(0)}</div>
            </div>
        </div>

        {item.variant_value && (
          <div className="luxe-variant-tag">
            <span className="variant-dot"></span>
            <span className="variant-label">CONFIG: {item.variant_value.toUpperCase()}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ─── SUCCESS OVERLAY (ORDER PLACED) ─── */
const SuccessOverlay = () => {
    const navigate = useNavigate();
    const { cartItems } = useCart();
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
                                    id: Math.random().toString(36).substr(2, 9).toUpperCase(),
                                    date: new Date(),
                                    items: cartItems.map(i => ({
                                        name: i.name || i.product_name,
                                        price: i.price,
                                        quantity: i.quantity
                                    })),
                                    total: cartItems.reduce((s, i) => s + (i.price * i.quantity), 0)
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

/* ─── LOGISTICS DRAWER (SLIDE-OVER) ─── */
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
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="drawer-institutional-header">
        <div className="header-meta">
            <span className="meta-badge">COORDINATE DEPLOYMENT</span>
            <h2>Logistics Hub</h2>
        </div>
        <button onClick={onClose} className="drawer-close-btn"><X size={24} /></button>
      </div>
      
      <div className="drawer-scroll-ecom360 no-scrollbar">
        <div className="drawer-info-block">
            <div className="info-icon"><Navigation size={18} /></div>
            <p>Modify your delivery destination or deploy new logistics coordinates for this transaction.</p>
        </div>
        
        <AddressManager />
      </div>

      <div className="drawer-institutional-footer">
         <ShieldCheck size={14} />
         <span>SECURE END-TO-END DATA ENCRYPTION ACTIVE</span>
      </div>
    </motion.div>
  </motion.div>
);

/* ─── MAIN CART PAGE ─── */
const CartPage = () => {
  const { cartItems, updateItemQuantity, removeFromCart, placeOrderFromCart, clearCart } = useCart();
  const { selectedAddress, loadAddresses, addresses } = useAddress();
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();

  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' -> 'shipping' -> 'payment'
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
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
    const shipping = subtotal > 2000 ? 0 : subtotal ? 200 : 0; 
    const tax = Math.round(subtotal * 0.18); // 18% Luxury GST
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
      
      await placeOrderFromCart(selectedAddress);
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

  // CHECK GUEST STATUS FIRST
  if (!isAuthenticated) {
      return <GuestCartState />;
  }

  if (!cartItems.length && !orderSuccess) {
    return (
      <div className="checkout-page empty-luxe-state">
        <motion.div 
            className="empty-luxe-card"
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
        >
          <div className="empty-luxe-visual">
             <ShoppingBag size={80} strokeWidth={1} className="text-slate-200" />
             <div className="empty-glow"></div>
          </div>
          <h2 className="empty-luxe-title">Your Bag is Empty</h2>
          <p className="empty-luxe-text">It looks like you haven't added anything to your cart yet.</p>
          <button className="btn-elite-deployment m-0 w-auto px-12" onClick={() => navigate("/")}>
             <Zap size={18} /> START SHOPPING
          </button>
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
              <ArrowLeft size={18} /> CONTINUE SHOPPING
            </button>
            <button className="empty-cart-btn" onClick={clearCart}>
              <Trash2 size={18} /> CLEAR BAG
            </button>
          </div>
        </motion.div>

        <div className="checkout-content">
          <div className="left-section">
            {/* PREMIUM STEP INDICATOR */}
            <div className="checkout-wizard-header">
              <div className={`wizard-step ${checkoutStep === 'cart' ? 'active' : 'completed'}`}>
                <div className="wizard-icon">
                  {checkoutStep === 'cart' ? <ShoppingBag size={24} /> : <CheckCircle2 size={24} />}
                </div>
                <div className="wizard-label">Curate Bag</div>
              </div>
              <div className="wizard-line"></div>
              <div className={`wizard-step ${checkoutStep === 'shipping' ? 'active' : (checkoutStep === 'payment' ? 'completed' : 'pending')}`}>
                <div className="wizard-icon">
                  {checkoutStep === 'shipping' ? <MapPin size={24} /> : (checkoutStep === 'payment' ? <CheckCircle2 size={24} /> : "02")}
                </div>
                <div className="wizard-label">Secure Shipping</div>
              </div>
              <div className="wizard-line"></div>
              <div className={`wizard-step ${checkoutStep === 'payment' ? 'active' : 'pending'}`}>
                <div className="wizard-icon">
                   <ShieldCheck size={24} />
                </div>
                <div className="wizard-label">Elite Payment</div>
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
                      <MapPin size={26} />
                    </div>
                    <h2>Secure Logistics Hub</h2>
                  </div>
                  <button className="manage-address-btn-luxe" onClick={() => setShowAddressModal(true)}>
                    {selectedAddress ? <><Edit2 size={16} /> CHANGE DESTINATION</> : <><Plus size={16} /> ADD ADDRESS</>}
                  </button>
                </div>

                {selectedAddress ? (
                  <div className="selected-address-ecom360">
                    <div className="ecom360-upper">
                        <div className="ecom360-status-pill">
                            <Globe size={10} />
                            <span>ELITE LOGISTICS PROTOCOL</span>
                        </div>
                        <div className="ecom360-verification-shield">
                            <ShieldCheck size={28} className="text-[#3b82f6]" strokeWidth={2.5} />
                        </div>
                    </div>

                    <div className="ecom360-body">
                        <div className="ecom360-identity-group">
                            <h4 className="ecom360-name">{(selectedAddress.full_name || selectedAddress.name).toUpperCase()}</h4>
                            <p className="ecom360-location-summary">{selectedAddress.city.toUpperCase()}, {selectedAddress.state.toUpperCase()}</p>
                        </div>
                        
                        <div className="ecom360-address-details">
                            <p className="ecom360-street">{getAddressLine(selectedAddress)}</p>
                            <p className="ecom360-pincode">Postal Zone: {getPincode(selectedAddress)}</p>
                        </div>

                        <div className="ecom360-comms-terminal">
                            <div className="ecom360-verified-badge">
                                <Navigation size={12} className="text-emerald-500" />
                                <span>GPS VERIFIED COORDINATES</span>
                            </div>
                            <div className="ecom360-phone-display">
                                <span className="text-[10px] text-slate-400 font-black">PH</span>
                                <span className="font-bold tracking-widest">{getPhone(selectedAddress)}</span>
                            </div>
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-address-warning-large" onClick={() => setShowAddressModal(true)}>
                    <div className="icon-pulse"><MapPin size={40} /></div>
                    <h3>Where shall we deliver?</h3>
                    <p>Select a verified destination for your luxury items.</p>
                    <button className="inline-add-btn">Establish First Protocol</button>
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
                  <PackageCheck size={28} className="text-green-500" /> Secure Payment Hub
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
                      <h3>Cards Protocol</h3>
                      <p>Visa, Mastercard, Platinum Amex</p>
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
                      <h3>Instant UPI</h3>
                      <p>Google Pay, PhonePe, Secure QR</p>
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
                      <h3>Banking Portal</h3>
                      <p>Secure Institutional Transfer</p>
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
                      <h3>Pay on Arrival</h3>
                      <p>Privilege Delivery Protocol</p>
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
              <span className="row-label-luxe">Items Subtotal ({cartItems.length})</span>
              <span className="row-value-luxe">₹{totals.subtotal.toLocaleString()}</span>
            </div>

            <div className="price-row">
              <span className="row-label-luxe">Shipping Fee</span>
              <span className={totals.shipping === 0 ? "row-value-luxe text-emerald-500" : "row-value-luxe"}>
                {totals.shipping === 0 ? "FREE" : `₹${totals.shipping}`}
              </span>
            </div>

            <div className="price-row">
              <span className="row-label-luxe">GST (18%)</span>
              <span className="row-value-luxe">₹{totals.tax.toLocaleString()}</span>
            </div>

            <div className="price-row total-row-premium">
              <span className="total-label-luxe">Total Amount</span>
              <span className="total-value-luxe">₹{totals.total.toLocaleString()}</span>
            </div>

            <div className="security-nexus-badge">
               <ShieldCheck size={14} />
               <span>Secure Checkout Active</span>
            </div>

            {orderError && (
              <div className="order-error-banner">
                <AlertCircle size={18} />
                <span>{orderError}</span>
              </div>
            )}

            <button
              className={`btn-elite-deployment ${(!selectedAddress || isPlacingOrder || (checkoutStep === 'payment' && !paymentMethod)) ? "btn-locked" : ""}`}
              onClick={() => {
                if (checkoutStep === 'cart') setCheckoutStep('shipping');
                else if (checkoutStep === 'shipping') setCheckoutStep('payment');
                else handlePlaceOrder();
              }}
              disabled={isPlacingOrder}
            >
              <div className="btn-glow-container">
                {isPlacingOrder ? (
                  <><Loader2 size={24} className="spin-icon" /> ANALYZING LOGISTICS & FUNDS...</>
                ) : (
                  <>
                    <span>
                      {checkoutStep === 'cart' ? 'PROCEED TO CHECKOUT' :
                       checkoutStep === 'shipping' ? 'CONTINUE TO PAYMENT' :
                       'PLACE SECURE ORDER'}
                    </span>
                    <div className="btn-icon-pulse">
                      {checkoutStep === 'payment' ? <ShieldCheck size={20} /> : <Zap size={20} />}
                    </div>
                  </>
                )}
              </div>
              <div className="btn-shine-overlay"></div>
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
        {orderSuccess && <SuccessOverlay />}
      </AnimatePresence>
    </div>
  );
};

/** Helper component for cart item image */
const CartItemImage = ({ url, name }) => {
  const { src } = useSmartImage(url);
  return (
    <img
      src={src}
      alt={name}
      onError={(e) => { 
        if (!e.target.src.includes('no-image')) {
          e.target.src = getImageUrl(null); 
        }
      }}
    />
  );
};

export default CartPage;
