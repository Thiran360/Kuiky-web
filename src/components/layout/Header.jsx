import React, { useCallback, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, ShoppingCart, LogOut, Heart, ChevronDown, Home, MapPin, Package, X, Sparkles, Mic, Camera } from "lucide-react";
import "./Header.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useUser } from "../../context/UserContext";
import { useWishlist } from "../../context/WishlistContext";

const Header = ({ searchTerm, setSearchTerm }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Auto-navigate to home if searching from another page
    useEffect(() => {
        if (searchTerm && location.pathname !== "/") {
            navigate("/");
        }
    }, [searchTerm, location.pathname, navigate]);

    const [openUserDropdown, setOpenUserDropdown] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const userDropdownRef = useRef(null);

    const [isFocused, setIsFocused] = useState(false);
    const { cartItemCount } = useCart();
    const { user, logout, isAuthenticated } = useUser();
    const { wishlistCount } = useWishlist();
    const [isListening, setIsListening] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    const userName = user?.name || user?.username || "Account";

    // 🎤 Toggle Voice Search
    const handleVoiceSearch = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchTerm(transcript);
        };

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    }, [isListening, setSearchTerm]);

    // 📸 Visual Search Simulation
    const handleVisualSearch = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            alert("Visual search feature is initializing. [Premium AI Scan Mode Active]");
        }, 2000);
    };

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setOpenUserDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setOpenUserDropdown(false);
        navigate("/");
    };

    const navigateTo = (path) => {
        navigate(path);
        setOpenUserDropdown(false);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className={`header-container ${isScrolled ? 'scrolled' : ''}`}>
            <div className="header-content">
                {/* Logo Section */}
                <div className="header-logo-section">
                    <motion.div
                        className="header-logo-text cursor-pointer"
                        onClick={() => navigateTo("/")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Ecom<span className="header-logo-accent">360</span>
                        <div className="header-logo-dot"></div>
                    </motion.div>
                </div>

                {/* Search Bar (Desktop) */}
                <div className="header-search-container">
                    <motion.div
                        className={`header-search-input-wrapper ${isFocused ? 'focused' : ''}`}
                        animate={{
                            scale: isFocused ? 1.02 : 1,
                            y: isFocused ? -2 : 0
                        }}
                    >
                        <Search className={`header-search-icon ${isFocused ? 'active' : ''}`} size={20} />
                        <input
                            type="text"
                            placeholder="Search Ecom360 for Elite Assets..."
                            className="header-search-input"
                            value={searchTerm || ""}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                        <AnimatePresence>
                            {searchTerm ? (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => setSearchTerm("")}
                                    className="header-search-clear"
                                >
                                    <X size={16} />
                                </motion.button>
                            ) : (
                                <div className="header-search-right-actions">
                                    <motion.button
                                        className={`search-action-icon ${isListening ? 'listening' : ''}`}
                                        onClick={handleVoiceSearch}
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.9 }}
                                        title="Voice Search"
                                    >
                                        <Mic size={18} />
                                        {isListening && <span className="mic-pulse" />}
                                    </motion.button>
                                    <motion.button
                                        className={`search-action-icon ${isScanning ? 'scanning' : ''}`}
                                        onClick={handleVisualSearch}
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.9 }}
                                        title="Visual Search"
                                    >
                                        <Camera size={18} />
                                        {isScanning && <span className="camera-scan-glow" />}
                                    </motion.button>
                                </div>
                            )}
                        </AnimatePresence>

                        {isFocused && (
                            <motion.div
                                className="search-glow-effect"
                                layoutId="searchGlow"
                                transition={{ duration: 0.4 }}
                            />
                        )}
                    </motion.div>
                </div>

                {/* Actions Hub */}
                <div className="header-actions">
                    <NavButton
                        icon={Home}
                        label="Home"
                        active={isActive("/")}
                        onClick={() => navigateTo("/")}
                    />

                    <NavButton
                        icon={Heart}
                        label="Wishlist"
                        count={wishlistCount}
                        active={isActive("/wishlist")}
                        onClick={() => navigateTo("/wishlist")}
                        isWishlist={true}
                    />

                    <NavButton
                        icon={ShoppingCart}
                        label="Cart"
                        count={cartItemCount}
                        active={isActive("/cart")}
                        onClick={() => navigateTo("/cart")}
                    />

                    {/* Highly Polished User Section */}
                    <div className="header-user-section" ref={userDropdownRef}>
                        {isAuthenticated ? (
                            <div className="header-user-dropdown-container">
                                <motion.button
                                    className={`header-user-pill ${openUserDropdown ? 'open' : ''}`}
                                    onClick={() => setOpenUserDropdown(!openUserDropdown)}
                                    layoutId="userPill"
                                >
                                    <div className="user-avatar-small">
                                        <User size={16} strokeWidth={2.5} />
                                    </div>
                                    <span className="user-pill-name">{userName}</span>
                                    <ChevronDown size={14} className={`pill-chevron ${openUserDropdown ? 'rotate' : ''}`} />
                                </motion.button>

                                <AnimatePresence>
                                    {openUserDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                            className="header-user-dropdown"
                                        >
                                            <div className="dropdown-header">
                                                <div className="flex flex-col gap-4">
                                                    <div className="user-avatar-small ring-2 ring-white/10 ring-offset-2 ring-offset-[#0f172a]">
                                                        <User size={20} strokeWidth={2.5} className="text-white" />
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="premium-badge-luxury">
                                                            <span className="premium-badge-text">Premium Member</span>
                                                        </div>
                                                        <div className="mt-1">
                                                            <p className="dropdown-title items-center gap-2">
                                                                {userName}
                                                                <Sparkles size={18} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]" />
                                                            </p>
                                                            <p className="dropdown-subtitle text-slate-200 opacity-100">{user?.email || 'premium@ecom360.com'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <motion.div
                                                className="dropdown-menu-list"
                                                initial="hidden"
                                                animate="visible"
                                                variants={{
                                                    visible: {
                                                        transition: {
                                                            staggerChildren: 0.05
                                                        }
                                                    }
                                                }}
                                            >
                                                <DropdownItem icon={User} label="Profile & Settings" onClick={() => navigateTo("/profile")} />
                                                <DropdownItem icon={MapPin} label="Shipping Addresses" onClick={() => navigateTo("/address")} />
                                                <DropdownItem icon={Package} label="Order History" onClick={() => navigateTo("/orders")} />
                                                <motion.div
                                                    className="dropdown-divider"
                                                    variants={{
                                                        hidden: { scaleX: 0, opacity: 0 },
                                                        visible: { scaleX: 1, opacity: 1 }
                                                    }}
                                                />
                                                <DropdownItem icon={LogOut} label="Sign Out" onClick={handleLogout} isLogout={true} />
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.button
                                className="header-login-btn-premium"
                                onClick={() => navigateTo("/login")}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <User size={18} strokeWidth={2.5} />
                                <span>Sign In</span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

const NavButton = ({ icon: Icon, label, count, active, onClick, isWishlist }) => (
    <motion.button
        className={`header-action-btn ${active ? 'active' : ''}`}
        onClick={onClick}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.95 }}
    >
        <div className="icon-wrapper-premium">
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            <AnimatePresence>
                {count > 0 && (
                    <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={`header-action-badge ${isWishlist ? 'header-wishlist-badge' : ''}`}
                    >
                        {count}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
        <span className="action-label">{label}</span>
        {active && <motion.div layoutId="navTab" className="active-dot-premium" />}
    </motion.button>
);

const DropdownItem = ({ icon: Icon, label, onClick, isLogout }) => (
    <motion.button
        onClick={onClick}
        className={`dropdown-item ${isLogout ? 'logout' : ''}`}
        variants={{
            hidden: { opacity: 0, x: -10 },
            visible: { opacity: 1, x: 0 }
        }}
        whileTap={{ scale: 0.98 }}
    >
        <div className="dropdown-icon-wrap">
            <Icon size={18} strokeWidth={2.2} />
        </div>
        <span>{label}</span>
    </motion.button>
);

export default Header;