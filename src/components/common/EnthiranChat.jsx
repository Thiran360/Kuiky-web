import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Loader2, Bot, Sparkles, User, Minimize2, Maximize2, X, Zap, ShoppingBag, Heart, Package, UserCircle, Home } from "lucide-react";
import "./EnthiranChat.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useOrder } from "../../context/OrderContext";

// 🤖 USER REQUESTED CONCIERGE LOGO
const ENTHIRAN_AVATAR = "/enthiran_concierge_master.png";

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
        
        // Add user message if it's not already in the stream (to avoid duplicates for input sends)
        setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.text === processedCommand && lastMsg.type === 'user') return prev;
            return [...prev, { id: Date.now(), type: "user", text: processedCommand }];
        });

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
            } else if (lowInput.includes("hello") || lowInput.includes("hi")) {
                botResponse = `Greetings. My neural processors are operating at peak efficiency. How may I serve you?`;
            } else {
                botResponse = "Analysis complete. I've noted your inquiry and am optimizing the shopping stream accordingly.";
            }
            
            setMessages(prev => [...prev, { id: Date.now() + 1, type: "bot", text: botResponse }]);
            setIsThinking(false);
        }, 800); 
    };

    const handleSend = (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || isThinking) return;
        
        const userInput = input.trim();
        setMessages(prev => [...prev, { id: Date.now(), type: "user", text: userInput }]);
        setInput("");
        handleCommand(userInput);
    };

    return (
        <div className="enthiran-root">
            {/* 🤖 TRIGGER BUBBLE */}
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
                        {/* HEADER - OBSIDIAN GOLD PROTOCOL */}
                        <div className="win-header-luxe">
                            <div className="flex items-center gap-4">
                                <div className="avatar-shield-outer">
                                    <div className="avatar-shield-inner">
                                        <div className="avatar-ai-core">
                                            <Zap size={18} fill="currentColor" />
                                        </div>
                                    </div>
                                </div>
                                <div className="title-stack">
                                    <span className="name-elite">ENTHIRAN ELITE AI</span>
                                    <div className="status-badge-premium">
                                        <div className="secure-scan-line"></div>
                                        <span className="pulse-dot-gold"></span>
                                        PROTOCOL: SECURED ACQUISITION
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

                            <div className="option-grid-compact">
                                <button onClick={() => handleCommand("Open Cart")} className="option-pill-luxe">
                                    <ShoppingBag size={18} /> <span>COMMERCE PORTAL</span>
                                </button>
                                <button onClick={() => handleCommand("Open Wishlist")} className="option-pill-luxe">
                                    <Heart size={18} /> <span>DESIRES LOG</span>
                                </button>
                                <button onClick={() => handleCommand("Open Orders")} className="option-pill-luxe">
                                    <Package size={18} /> <span>LOGISTICS HUB</span>
                                </button>
                                <button onClick={() => handleCommand("Go To Profile")} className="option-pill-luxe">
                                    <UserCircle size={18} /> <span>IDENTITY MODULE</span>
                                </button>
                                <button onClick={() => handleCommand("Return Home")} className="option-pill-luxe">
                                    <Home size={18} /> <span>PRIMARY HUB</span>
                                </button>
                            </div>

                            {isThinking && (
                                <div className="msg-row-luxe bot mt-4">
                                    <div className="msg-bubble-luxe thinking-luxe shadow-glow-gold">
                                        <Loader2 size={14} className="animate-spin text-yellow-400" />
                                        <span>OPTIMIZING BIO-STREAM...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ⌨️ INTERACTIVE CONSOLE - OBSIDIAN GRADE */}
                        <div className="win-footer-luxe">
                            <form onSubmit={handleSend} className="chat-input-wrapper-elite">
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your elite inquiry..." 
                                    className="elite-input-field"
                                    disabled={isThinking}
                                />
                                <button 
                                    type="submit" 
                                    className="elite-send-btn"
                                    disabled={!input.trim() || isThinking}
                                >
                                    {isThinking ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EnthiranChat;
