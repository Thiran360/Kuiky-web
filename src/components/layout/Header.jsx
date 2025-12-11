// src/components/layout/Header.jsx
import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  Search,
  User,
  ShoppingCart,
  Menu,
  LogOut,
  Heart,
  ChevronDown
} from "lucide-react";

import "./Header.css";
import { useNavigate } from "react-router-dom";

import { useUser } from "../../context/UserContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const Header = ({ searchTerm = "", setSearchTerm = () => {} }) => {
  const navigate = useNavigate();

  const { isAuthenticated, user, logout } = useUser();
  const { cartItems = [], totalItems } = useCart();
  const { wishlist = [] } = useWishlist();

  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  /** ---------- SAFE USERNAME ---------- */
  const safeString = (v) =>
    typeof v === "string" && v.trim() !== "" ? v.trim() : null;

  const userName =
    safeString(user?.username) ||
    safeString(user?.name) ||
    safeString(user?.mobile_number?.toString()) ||
    "User";

  /** ---------- CART COUNT ---------- */
  const cartItemCount =
    totalItems ||
    cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  /** ---------- WISHLIST COUNT ---------- */
  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;

  /** ---------- NAVIGATION HELPERS ---------- */
  const goHome = useCallback(() => navigate("/"), [navigate]);
  const goWishlist = useCallback(() => navigate("/wishlist"), [navigate]);
  const goCart = useCallback(() => navigate("/cart"), [navigate]);
  const goProfile = useCallback(() => navigate("/profile"), [navigate]);
  const goOrders = useCallback(() => navigate("/orders"), [navigate]);
  const goHistory = useCallback(() => navigate("/history"), [navigate]);
  const goLogin = useCallback(() => navigate("/login"), [navigate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
    setOpenDropdown(false);
  }, [logout, navigate]);

  /** ---------- DROPDOWN HANDLING ---------- */
  const toggleDropdown = () => setOpenDropdown((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header-container">
      <div className="header-content">

        {/* LEFT SECTION */}
        <div className="header-logo-section">
          <button className="header-menu-btn">
            <Menu size={24} className="text-gray-700" />
          </button>

          <div className="header-logo-text" onClick={goHome} style={{ cursor: "pointer" }}>
            Ecom<span className="header-logo-accent">360</span>
            <div className="header-logo-dot"></div>
          </div>
        </div>

        {/* SEARCH BAR (DESKTOP) */}
        <div className="header-search-container">
          <input
            type="text"
            placeholder="Search for vegetables, fruits, dairy..."
            className="header-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="header-search-icon" size={18} />
        </div>

        {/* RIGHT ACTIONS */}
        <div className="header-actions">

          {/* WISHLIST */}
          <button className="header-wishlist-btn" onClick={goWishlist}>
            <Heart size={22} />
            {wishlistCount > 0 && (
              <span className="header-wishlist-badge">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </button>

          {/* CART */}
          <button className="header-cart-btn" onClick={goCart}>
            <ShoppingCart size={24} />
            {cartItemCount > 0 && (
              <span className="header-cart-badge">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </button>

          {/* USER AREA */}
          {isAuthenticated ? (
            <div className="header-user-dropdown-wrapper" ref={dropdownRef}>
              <button className="header-user-btn" onClick={toggleDropdown}>
                <User size={18} />
                <span>{userName}</span>
                <ChevronDown size={14} />
              </button>

              {openDropdown && (
                <div className="header-dropdown-menu">
                  <button onClick={() => { goProfile(); setOpenDropdown(false); }}>
                    <User size={16} /> Profile
                  </button>
                  <button onClick={() => { goOrders(); setOpenDropdown(false); }}>
                    🛍 Orders
                  </button>
                  <button onClick={() => { goHistory(); setOpenDropdown(false); }}>
                    📜 History
                  </button>
                  <button onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="header-login-btn" onClick={goLogin}>
              <User size={18} />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* MOBILE SEARCH */}
      <div className="header-mobile-search">
        <div className="header-mobile-search-wrapper">
          <input
            type="text"
            placeholder="Search products..."
            className="header-mobile-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="header-mobile-search-icon" size={16} />
        </div>
      </div>
    </header>
  );
};

export default Header;
