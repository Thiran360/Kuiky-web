// src/components/layout/Header.jsx
import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  Search,
  User,
  ShoppingCart,
  LogOut,
  Heart,
  ChevronDown,
  Menu, // The 3-line icon (for closed state)
  X,    // The Cross icon (for open state)
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

  // State for the authenticated user dropdown (desktop/large mobile)
  const [openUserDropdown, setOpenUserDropdown] = useState(false);
  // State for the mobile "More" menu (cart, wishlist, user/login)
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

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
  const goWishlist = useCallback(() => {
    navigate("/wishlist");
    setOpenMobileMenu(false); // Close menu after navigation
  }, [navigate]);
  const goCart = useCallback(() => {
    navigate("/cart");
    setOpenMobileMenu(false); // Close menu after navigation
  }, [navigate]);
  const goProfile = useCallback(() => {
    navigate("/profile");
    setOpenUserDropdown(false);
    setOpenMobileMenu(false);
  }, [navigate]);
  const goOrders = useCallback(() => {
    navigate("/orders");
    setOpenUserDropdown(false);
    setOpenMobileMenu(false);
  }, [navigate]);
  const goHistory = useCallback(() => {
    navigate("/history");
    setOpenUserDropdown(false);
    setOpenMobileMenu(false);
  }, [navigate]);
  const goLogin = useCallback(() => {
    navigate("/login");
    setOpenMobileMenu(false); // Close menu after navigation
  }, [navigate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
    setOpenUserDropdown(false);
    setOpenMobileMenu(false);
  }, [logout, navigate]);

  /** ---------- DROPDOWN/MENU HANDLING (Click Outside) ---------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close User Dropdown (Desktop)
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setOpenUserDropdown(false);
      }
      // Close Mobile Menu (3-line)
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setOpenMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header-container">
      <div className="header-content">
        {/* LEFT SECTION (Logo only) */}
        <div className="header-logo-section">
          <div
            className="header-logo-text"
            onClick={goHome}
            style={{ cursor: "pointer" }}
          >
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

        {/* RIGHT ACTIONS - DESKTOP & MOBILE */}
        <div className="header-actions">
          {/* DESKTOP ACTIONS: WISHLIST & CART (Hidden on Mobile) */}
          <button
            className="header-action-btn header-wishlist-btn header-desktop-only"
            onClick={goWishlist}
            aria-label="Wishlist"
          >
            <Heart size={22} />
            {wishlistCount > 0 && (
              <span className="header-action-badge header-wishlist-badge">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
            <span className="action-label">Wishlist</span>
          </button>

          <button
            className="header-action-btn header-cart-btn header-desktop-only"
            onClick={goCart}
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={24} />
            {cartItemCount > 0 && (
              <span className="header-action-badge header-cart-badge">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
            <span className="action-label">Cart</span>
          </button>

          {/* DESKTOP: USER AREA (Hidden on small mobile) */}
          <div className="header-desktop-user-area">
            {isAuthenticated ? (
              <div
                className="header-user-dropdown-wrapper"
                ref={userDropdownRef}
              >
                <button
                  className="header-user-btn"
                  onClick={() => setOpenUserDropdown((prev) => !prev)}
                  aria-expanded={openUserDropdown}
                  aria-label={`User Menu for ${userName}`}
                >
                  <User size={18} />
                  <span className="header-user-name">{userName}</span>
                  <ChevronDown size={14} className="header-chevron" />
                </button>

                {openUserDropdown && (
                  <div className="header-dropdown-menu">
                    <button onClick={goProfile}>
                      <User size={16} /> Profile
                    </button>
                    <button onClick={goOrders}>🛍 Orders</button>
                    <button onClick={goHistory}>📜 History</button>
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
          
          {/* MOBILE: MENU BUTTON (3-lines / X) */}
          <div className="header-mobile-more-wrapper" ref={mobileMenuRef}>
            <button
              className="header-action-btn header-mobile-more-btn"
              onClick={() => setOpenMobileMenu((prev) => !prev)}
              aria-label={openMobileMenu ? "Close menu" : "Open menu"}
              aria-expanded={openMobileMenu}
            >
              {/* CONDITIONAL RENDERING: Show X when open, Menu when closed */}
              {openMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>

            {openMobileMenu && (
              <div className="header-mobile-menu">
                <p className="header-mobile-menu-title">Account & Actions</p>
                {/* Wishlist in Mobile Menu */}
                <button onClick={goWishlist} className="menu-item-with-badge">
                  <div className="menu-icon-text">
                      <Heart size={18} /> Wishlist
                  </div>
                  {wishlistCount > 0 && (
                    <span className="mobile-menu-badge">{wishlistCount}</span>
                  )}
                </button>
                {/* Cart in Mobile Menu */}
                <button onClick={goCart} className="menu-item-with-badge">
                   <div className="menu-icon-text">
                        <ShoppingCart size={18} /> Cart
                   </div>
                  {cartItemCount > 0 && (
                    <span className="mobile-menu-badge">{cartItemCount}</span>
                  )}
                </button>

                <div className="header-mobile-menu-divider"></div>

                {/* User/Login in Mobile Menu */}
                {isAuthenticated ? (
                  <>
                    <button onClick={goProfile}>
                      <User size={16} /> Profile ({userName})
                    </button>
                    <button onClick={goOrders}>🛍 Orders</button>
                    <button onClick={goHistory}>📜 History</button>
                    <button onClick={handleLogout} className="logout-btn">
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                ) : (
                  <button onClick={goLogin} className="login-btn">
                    <User size={16} /> Login
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE SEARCH BAR (below header-content) */}
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