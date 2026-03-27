// src/components/auth/CustomerAuth.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Mail, Phone, Lock, User,
  CheckCircle2, XCircle, Loader2,
  Eye, EyeOff, Star, ShieldCheck, Sparkles
} from "lucide-react";

import "./CustomerAuth.css";
import { setAuthToken } from "../../api/api";
import { customerService } from "../../api/authService";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

const DYNAMIC_BGS = [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff", // Dark Nike
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da", // Aesthetic shopping bags
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d", // Model fashion
    "https://images.unsplash.com/photo-1445205170230-053b83016050", // Coat aesthetic
    "https://images.unsplash.com/photo-1555529733-0e670560f0e1"  // Clothes rack
];

const CustomerAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [bgImage, setBgImage] = useState("");

    useEffect(() => {
        // Dynamically select a premium image on load
        const randomImg = DYNAMIC_BGS[Math.floor(Math.random() * DYNAMIC_BGS.length)];
        setBgImage(`${randomImg}?q=80&w=2070&auto=format&fit=crop`);
    }, []);

    return (
        <div className="premium-auth-container">
            {/* Mesh Background */}
            <div className="mesh-gradient">
                <div className="mesh-circle mc-1"></div>
                <div className="mesh-circle mc-2"></div>
                <div className="mesh-circle mc-3"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="premium-auth-card"
            >
                <div className="premium-card-split">
                    {/* VISUAL SIDE */}
                    <div className="auth-hero-side">
                        <div className="hero-overlay">
                            <div className="hero-brand">
                                <ShoppingBag size={28} strokeWidth={2.5} />
                                <span>ShopConnect</span>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isLogin ? 'login-h' : 'signup-h'}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="hero-text-block"
                                >
                                    <h1 className="hero-title-main">
                                        {isLogin ? "Exclusive Access." : "Join the Elite."}
                                    </h1>
                                    <p className="hero-description">
                                        {isLogin 
                                            ? "Welcome back to your curated shopping experience. Access your world of premium benefits." 
                                            : "Unlock a new realm of shopping. Exclusive deals, early access, and personalized rewards await."}
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            <div className="hero-stats">
                                <div className="stat-pill">
                                    <Star size={14} fill="var(--primary-brand)" />
                                    <span>4.9/5 Service</span>
                                </div>
                                <div className="stat-pill">
                                    <ShieldCheck size={14} />
                                    <span>Verified</span>
                                </div>
                            </div>
                        </div>
                        {/* THE PREMIUM ILLUSTRATION */}
                        <div 
                            className="hero-illustration-bg"
                            style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none' }}
                        ></div>
                    </div>

                    {/* FORM SIDE */}
                    <div className="auth-form-side">
                        <div className="form-header-premium">
                            <nav className="auth-nav-tabs">
                                <button 
                                    className={`auth-tab-link ${isLogin ? 'active' : ''}`}
                                    onClick={() => setIsLogin(true)}
                                >
                                    Login
                                </button>
                                <button 
                                    className={`auth-tab-link ${!isLogin ? 'active' : ''}`}
                                    onClick={() => setIsLogin(false)}
                                >
                                    Join Now
                                </button>
                            </nav>
                        </div>

                        <div className="form-content-viewport">
                            <AnimatePresence mode="wait">
                                {isLogin ? (
                                    <motion.div
                                        key="login-view"
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -30 }}
                                        className="view-wrapper"
                                    >
                                        <LoginForm />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="join-view"
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -30 }}
                                        className="view-wrapper"
                                    >
                                        <RegisterForm onRegistered={() => setIsLogin(true)} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
const LoginForm = () => {
    const [formData, setFormData] = useState({ mobile_number: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });
    const [showPass, setShowPass] = useState(false);
    
    const navigate = useNavigate();
    const { handleLoginSuccess } = useUser();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!formData.mobile_number || !formData.password) {
            setMsg({ type: "error", text: "All fields are mandatory" });
            return;
        }

        setIsLoading(true);
        setMsg({ type: "", text: "" });

        try {
            const res = await customerService.login(formData.mobile_number, formData.password);
            handleLoginSuccess(res);
            navigate("/");
        } catch (err) {
            console.error("Caught Login Error:", err);
            const errorMsg = err.message || (typeof err === 'string' ? err : "Authentication failed. Please check your credentials.");
            setMsg({ type: "error", text: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };

    const triggerMessage = (text, type = "success") => {
        setMsg({ type, text });
        setTimeout(() => setMsg({ type: "", text: "" }), 5000);
    };

    return (
        <form onSubmit={handleLogin} className="premium-form">
            <div className="form-greeting">
                <h2>Welcome Back</h2>
                <p>Please enter your credentials to proceed</p>
            </div>

            <div className="inputs-stack">
                <ModernInput 
                    icon={Phone} 
                    label="Mobile Number" 
                    type="tel" 
                    value={formData.mobile_number}
                    onChange={(val) => setFormData({ ...formData, mobile_number: val })}
                />
                <ModernInput 
                    icon={Lock} 
                    label="Password" 
                    type={showPass ? "text" : "password"} 
                    value={formData.password}
                    onChange={(val) => setFormData({ ...formData, password: val })}
                    trailing={
                        <button type="button" className="eye-toggle" onClick={() => setShowPass(!showPass)}>
                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    }
                />
            </div>

            <div className="form-actions-row">
                <label className="premium-checkbox">
                    <input type="checkbox" />
                    <span className="chk-label">Keep me signed in</span>
                </label>
                <button 
                    type="button" 
                    className="text-btn"
                    onClick={() => triggerMessage("Password reset instructions sent to your registered contact!")}
                >
                    Forgot Password?
                </button>
            </div>

            {msg.text && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`form-alert ${msg.type}`}>
                    {msg.type === 'error' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                    <span>{msg.text}</span>
                </motion.div>
            )}

            <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`premium-btn black ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="spin" /> : "Sign In to ShopConnect"}
            </motion.button>

            <div className="social-login-group">
                <span className="divider-text">OR SIGN IN WITH</span>
                <div className="social-icons">
                    <button 
                        type="button" 
                        className="social-btn-premium"
                        onClick={() => triggerMessage("Mail login workflow is coming soon!")}
                    >
                        <Mail size={20} />
                    </button>
                    <button 
                        type="button" 
                        className="social-btn-premium fb"
                        onClick={() => triggerMessage("Facebook login integration requires API keys.")}
                    >
                        F
                    </button>
                    <button 
                        type="button" 
                        className="social-btn-premium google"
                        onClick={() => triggerMessage("Google OAuth has been successfully requested.")}
                    >
                        G
                    </button>
                </div>
            </div>
        </form>
    );
};

const RegisterForm = ({ onRegistered }) => {
    const [formData, setFormData] = useState({
        username: "", email: "", mobile_number: "", password: ""
    });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.email || !formData.mobile_number || !formData.password) {
            setMsg({ type: "error", text: "All fields are required" });
            return;
        }
        if (formData.password !== confirmPassword) {
            setMsg({ type: "error", text: "Passwords do not match" });
            return;
        }
        if (formData.password.length < 6) {
            setMsg({ type: "error", text: "Password must be at least 6 characters" });
            return;
        }

        setIsSubmitting(true);
        setMsg({ type: "", text: "" });
        try {
            const payload = { ...formData, role: "customer", mobile: formData.mobile_number };
            await customerService.register(payload);
            // Show success and switch to login tab
            setMsg({ type: "success", text: "Account created successfully! Please login with your credentials." });
            setTimeout(() => {
                if (onRegistered) onRegistered();
            }, 2000);
        } catch (err) {
            setMsg({ type: "error", text: "Registration failed. Please check your data." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSignup} className="premium-form register">
            <div className="form-greeting">
                <h2>Join the Community</h2>
                <p>Create your exclusive membership profile</p>
            </div>

            <div className="inputs-grid">
                <ModernInput 
                    icon={User} 
                    label="Full Name" 
                    value={formData.username}
                    onChange={(val) => setFormData({ ...formData, username: val })}
                />
                <ModernInput 
                    icon={Mail} 
                    label="Email Address" 
                    type="email" 
                    value={formData.email}
                    onChange={(val) => setFormData({ ...formData, email: val })}
                />
            </div>

            <ModernInput 
                icon={Phone} 
                label="Mobile Number" 
                type="tel" 
                value={formData.mobile_number}
                onChange={(val) => setFormData({ ...formData, mobile_number: val })}
            />

            <ModernInput 
                icon={Lock} 
                label="Password" 
                type={showPass ? "text" : "password"} 
                value={formData.password}
                onChange={(val) => setFormData({ ...formData, password: val })}
                trailing={
                    <button type="button" className="eye-toggle" onClick={() => setShowPass(!showPass)}>
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                }
            />

            <ModernInput 
                icon={ShieldCheck} 
                label="Confirm Password" 
                type={showConfirmPass ? "text" : "password"} 
                value={confirmPassword}
                onChange={(val) => setConfirmPassword(val)}
                trailing={
                    <button type="button" className="eye-toggle" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                        {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                }
            />

            {msg.text && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`form-alert ${msg.type}`}>
                    {msg.type === 'error' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                    <span>{msg.text}</span>
                </motion.div>
            )}

            <motion.button
                whileTap={{ scale: 0.97 }}
                className={`premium-btn register-btn ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
            >
                {isSubmitting ? <Loader2 className="spin" /> : <><Sparkles size={18} /> Create My Account</>}
            </motion.button>
        </form>
    );
};

const ModernInput = ({ icon: Icon, label, type = "text", value, onChange, trailing }) => {
    const [isFocused, setIsFocused] = useState(false);
    const id = useMemo(() => `in-${Math.random().toString(36).substr(2, 9)}`, []);

    return (
        <div className={`modern-field-group ${isFocused || value ? 'active' : ''} ${isFocused ? 'focused' : ''}`}>
            <div className="field-icon-wrap">
                <Icon size={18} strokeWidth={2.2} />
            </div>
            <div className="field-main">
                <label htmlFor={id} className="modern-label">{label}</label>
                <input 
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="modern-input-el"
                />
            </div>
            {trailing && <div className="field-trailing">{trailing}</div>}
        </div>
    );
};

export default CustomerAuth;