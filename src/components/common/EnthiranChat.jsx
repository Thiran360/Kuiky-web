import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Loader2, Bot, Sparkles, User, Minimize2, Maximize2, X, Zap, ShoppingBag, Heart, Package, UserCircle, Home } from "lucide-react";
import "./EnthiranChat.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useOrder } from "../../context/OrderContext";

const ENTHIRAN_AVATAR = "/enthiran_final_robot.jpg";

const EnthiranChat = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const scrollRef = useRef(null);

    const { user, isAuthenticated } = useUser();
    
    const cartCtx = useCart();
    const wishlistCtx = useWishlist();
    const orderCtx = useOrder();

    // Context Extraction
    const cartItemCount = cartCtx?.cartItemCount || 0;
    const wishlistItems = wishlistCtx?.wishlist || [];
    const orderItems = orderCtx?.orders || [];
    const userName = user?.name || "Biological Entity";

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    // Personalized Welcome Effect
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const name = user?.name || "Biological Entity";
            const greeting = isAuthenticated 
                ? `Good day, ${name}. I am Enthiran, your Elite Shopping Concierge. Status: Online & Secure. How can I facilitate your shopping journey today?`
                : `Greetings. I am Enthiran, the Elite Concierge. My processors are optimized for your luxury discovery. Please authenticate to access your curated bio-data.`;
            
            setMessages([{ id: Date.now(), type: "bot", text: greeting }]);
        }
    }, [isOpen, user, isAuthenticated]);

    const handleCommand = (commandText) => {
        if (!commandText || isThinking) return;
        const processedCommand = commandText.trim();
        setMessages(prev => [...prev, { id: Date.now(), type: "user", text: processedCommand }]);
        setIsThinking(true);
        
        // --- ⚡ LIGHT-SPEED EXECUTION ---
        setTimeout(() => {
            let botResponse = "Elite Concierge Analysis: Scanning parameters...";
            const lowInput = processedCommand.toLowerCase();
            
            if (lowInput.includes("cart") || lowInput.includes("bag")) {
                botResponse = "Directing to Secure Commerce Portal. Boutique items preserved.";
                navigate("/cart");
            } else if (lowInput.includes("wishlist")) {
                botResponse = "Opening Curated Desires Log. Analyzing candidates...";
                navigate("/wishlist");
            } else if (lowInput.includes("order")) {
                botResponse = "Establishing Logistics Link. Fetching History...";
                navigate("/orders");
            } else if (lowInput.includes("profile")) {
                botResponse = "Entering Bio-Data Module. Encryption active.";
                navigate("/profile");
            } else if (lowInput.includes("home")) {
                botResponse = "Returning to Primary Hub. Scanning arrivals.";
                navigate("/");
            } else {
                botResponse = "Understood. I'm prioritizing your request in the luxury stream.";
            }
            
            setMessages(prev => [...prev, { id: Date.now() + 1, type: "bot", text: botResponse }]);
            setIsThinking(false);
        }, 300); // ⭐️ Reduced delay for instant feedback
    };

    const handleSend = (e) => {
        if (e) e.preventDefault();
        if (!input.trim()) return;
        handleCommand(input);
        setInput("");
    };

    return (
        <div className="enthiran-root">
            {/* 🤖 TRIGGER - PRECISION CENTERED */}
            <motion.div 
                className="enthiran-trigger-group"
                style={{ 
                    display: isOpen ? 'none' : 'flex',
                    pointerEvents: 'auto'
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <button 
                    className="enthiran-trigger-bubble-premium"
                    onClick={() => setIsOpen(true)}
                    type="button"
                >
                    <img src={ENTHIRAN_AVATAR} alt="Bot" className="trigger-avatar-hq" />
                    <Sparkles size={20} className="absolute -top-2 -right-2 text-yellow-400 drop-shadow-lg" />
                </button>
            </motion.div>

            {/* 🛡️ ULTRA-PREMIUM CHAT INTERFACE */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        className="enthiran-window-luxe"
                        initial={{ opacity: 0, scale: 0.95, y: 50, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.95, y: 50, filter: "blur(10px)" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        {/* HEADER - CYBER GLASS STYLE */}
                        <div className="win-header-luxe">
                            <div className="flex items-center gap-4">
                                <div className="avatar-shield-outer">
                                    <div className="avatar-shield-inner">
                                        <Bot size={22} className="text-cyan-400" />
                                    </div>
                                </div>
                                <div className="title-stack">
                                    <span className="name-elite">ENTHIRAN ELITE</span>
                                    <div className="status-badge-premium">
                                        <span className="pulse-dot-cyan"></span>
                                        SECURE PROTOCOL ACTIVE
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsOpen(false);
                                }} 
                                className="win-close-btn-luxe"
                                type="button"
                                aria-label="Close"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* CONVO BODY - GLASS GRID */}
                        <div className="win-body-luxe no-scrollbar" ref={scrollRef}>
                            {messages.map((msg) => (
                                <motion.div 
                                    key={msg.id} 
                                    className={`msg-row-luxe ${msg.type}`}
                                    initial={{ opacity: 0, x: msg.type === 'bot' ? -10 : 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <div className="msg-bubble-luxe">
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                                           <div className="command-selector-luxe">
                                <div className="grid grid-cols-1 gap-4 mt-6">
                                    <button onClick={() => handleCommand("Open Cart")} className="option-btn-luxe group">
                                        <div className="btn-icon-luxe"><ShoppingBag size={20} /></div>
                                        <div className="btn-text-content">
                                            <span className="btn-main-text">Curated Shopping Bag</span>
                                            <span className="btn-sub-text">{cartItemCount} boutique items preserved</span>
                                        </div>
                                    </button>
                                    <button onClick={() => handleCommand("Open Wishlist")} className="option-btn-luxe group">
                                        <div className="btn-icon-luxe text-pink-500"><Heart size={20} /></div>
                                        <div className="btn-text-content">
                                            <span className="btn-main-text">Desires Log</span>
                                            <span className="btn-sub-text">{wishlistItems?.length || 0} elite candidates</span>
                                        </div>
                                    </button>
                                    <button onClick={() => handleCommand("Open Orders")} className="option-btn-luxe group">
                                        <div className="btn-icon-luxe text-blue-500"><Package size={20} /></div>
                                        <div className="btn-text-content">
                                            <span className="btn-main-text">Logistics Hub</span>
                                            <span className="btn-sub-text">Tracking {orderItems?.length || 0} active transits</span>
                                        </div>
                                    </button>
                                    <button onClick={() => handleCommand("Go To Profile")} className="option-btn-luxe group">
                                        <div className="btn-icon-luxe text-cyan-500"><UserCircle size={20} /></div>
                                        <div className="btn-text-content">
                                            <span className="btn-main-text">Identity Module</span>
                                            <span className="btn-sub-text">Modify bio-data & encryption</span>
                                        </div>
                                    </button>
                                    <button onClick={() => handleCommand("Return Home")} className="option-btn-luxe group">
                                        <div className="btn-icon-luxe text-green-500"><Home size={20} /></div>
                                        <div className="btn-text-content">
                                            <span className="btn-main-text">Primary Hub</span>
                                            <span className="btn-sub-text">Back to arrivals & curation</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {isThinking && (
                                <div className="msg-row-luxe bot">
                                    <div className="msg-bubble-luxe thinking-luxe shadow-glow">
                                        <Sparkles size={14} className="animate-spin text-cyan-400" />
                                        <span>Executing elite sequence...</span>
                                    </div>
                                </div>
                            )}
                        </div>
      
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EnthiranChat;
