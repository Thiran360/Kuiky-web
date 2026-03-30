import React, { useCallback, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, User, ShoppingCart, LogOut, Heart,
    ChevronDown, Home, MapPin, Package, X,
    Sparkles, Mic, Camera, Menu, LayoutGrid,
    TrendingUp, Star, Zap, ShoppingBag
} from "lucide-react";
import "./Header.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useUser } from "../../context/UserContext";
import { useWishlist } from "../../context/WishlistContext";

const Header = ({ searchTerm, setSearchTerm }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAuthenticated } = useUser();
    const { cartItemCount } = useCart();
    const { wishlistCount } = useWishlist();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const userName = user?.name || user?.username || "Account";

    useEffect(() => {
        if (searchTerm && location.pathname !== "/") {
            navigate("/");
        }
    }, [searchTerm, location.pathname, navigate]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);



    const handleLogout = () => { logout(); setIsMenuOpen(false); navigate("/"); };
    const navigateTo = (path) => { navigate(path); setIsMenuOpen(false); };
    const isActive = (path) => location.pathname === path;



    return (
        <header className={`header-container-luxe ${isScrolled ? 'scrolled' : ''}`}>
            <div className="header-primary-luxe">
                <div className="header-content-inner">
                    {/* Row 1 for Mobile (Logo & Actions) */}
                    <div className="header-content-inner-top">
                        <div className="header-left-hub">
                            <motion.div className="header-logo-luxe" onClick={() => navigateTo("/")}>
                                <ShoppingBag className="logo-icon-luxe" size={26} />
                                <span className="logo-text-luxe">Ecom<span>360</span></span>
                            </motion.div>
                        </div>

                        {/* UNIFIED SEARCH HUB */}
                        <div className="header-search-hub-luxe">
                            <SearchForm searchTerm={searchTerm} setSearchTerm={setSearchTerm} isFocused={isFocused} setIsFocused={setIsFocused} />
                        </div>

                        <div className="header-actions-hub-luxe">
                            <NavIconButton icon={Home} active={isActive("/")} onClick={() => navigateTo("/")} label="Home" />
                            <NavIconButton icon={Heart} count={wishlistCount} active={isActive("/wishlist")} onClick={() => navigateTo("/wishlist")} label="Wishlist" />
                            <NavIconButton icon={ShoppingCart} count={cartItemCount} active={isActive("/cart")} onClick={() => navigateTo("/cart")} label="Basket" />

                            <button className={`nav-icon-btn-luxe menu-trigger-luxe ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(true)}>
                                <div className="icon-stack"><Menu size={24} /></div>
                                <span>Menu</span>
                            </button>
                        </div>
                    </div>




                </div>
            </div>



            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mobile-overlay-luxe" onClick={() => setIsMenuOpen(false)} />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, mass: 0.8 }} className="mobile-drawer-luxe">
                            <div className="drawer-head-luxe">
                                <span className="drawer-logo-luxe">Ecom<span>360</span></span>
                                <button className="drawer-close-luxe" onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
                            </div>
                            <div className="drawer-body-luxe">
                                <div className="drawer-nav-group">
                                    <p className="drawer-label">ACCOUNT HUB</p>
                                    <div className="drawer-user-card-luxe">
                                        <div className="d-user-avatar-luxe">
                                            {isAuthenticated ? userName.charAt(0).toUpperCase() : "?"}
                                        </div>
                                        <div className="d-user-info-luxe">
                                            <p className="d-welcome-luxe">{isAuthenticated ? "AUTHORIZED MEMBER" : "ELITE GUEST"}</p>
                                            {isAuthenticated ? (
                                                <div className="d-auth-user-profile">
                                                    <p className="d-username-luxe">{userName}</p>
                                                    <span className="d-user-tier">GOLD TIER ACCESS</span>
                                                </div>
                                            ) : (
                                                <p className="d-username-luxe">Sign In to Proceed</p>
                                            )}
                                        </div>
                                    </div>
                                    <DrawerLink icon={User} label="Profile & Settings" onClick={() => navigateTo("/profile")} />
                                    <DrawerLink icon={MapPin} label="Shipping Addresses" onClick={() => navigateTo("/address")} />
                                    <DrawerLink icon={Package} label="Order History" onClick={() => navigateTo("/orders")} />
                                </div>

                                <div className="drawer-nav-group">
                                    <p className="drawer-label">ESSENTIALS</p>
                                    <DrawerLink icon={Home} label="Return Home" active={isActive("/")} onClick={() => navigateTo("/")} />
                                    <DrawerLink icon={Heart} label="My Wishlist" count={wishlistCount} onClick={() => navigateTo("/wishlist")} />
                                    <DrawerLink icon={ShoppingCart} label="Basket" count={cartItemCount} onClick={() => navigateTo("/cart")} />
                                    {!isAuthenticated && (
                                        <div className="drawer-auth-actions-group">
                                            <div className="divider-line-gold"></div>
                                            <DrawerLink icon={Zap} label="Login / Sign Up" onClick={() => navigateTo("/login")} className="auth-trigger-luxe" />
                                        </div>
                                    )}
                                </div>

                                {isAuthenticated && (
                                    <button className="btn-drawer-logout danger-luxe" onClick={handleLogout}>
                                        <LogOut size={18} /> Secure Logout
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};

const SearchForm = ({ searchTerm, setSearchTerm, isFocused, setIsFocused }) => (
    <form className={`search-form-luxe ${isFocused ? 'focused' : ''}`} onSubmit={(e) => e.preventDefault()}>
        <Search className="search-icon-luxe" size={20} />
        <input type="text" placeholder="Search for products..." className="search-input-luxe" value={searchTerm || ""} onChange={(e) => setSearchTerm(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} />
        {searchTerm && <button type="button" onClick={() => setSearchTerm("")} className="search-clear-luxe"><X size={16} /></button>}
    </form>
);

const NavIconButton = ({ icon: Icon, count, active, onClick, label }) => (
    <button className="nav-icon-btn-luxe" onClick={onClick}>
        <div className="icon-stack"><Icon size={24} />{count > 0 && <span className="icon-badge-luxe">{count}</span>}</div>
        <span>{label}</span>
    </button>
);

const DropdownLink = ({ icon: Icon, label, onClick, danger }) => (
    <button className={`dropdown-link-luxe ${danger ? 'danger' : ''}`} onClick={onClick}><Icon size={18} /><span>{label}</span></button>
);

const DrawerLink = ({ icon: Icon, label, onClick, count }) => (
    <button className="drawer-link-luxe" onClick={onClick}>
        <div className="d-icon-label"><Icon size={20} /><span>{label}</span></div>
        {count > 0 && <span className="d-badge-luxe">{count}</span>}
    </button>
);

export default Header;