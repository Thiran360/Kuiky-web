import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Mail, Lock, Phone, User, ShoppingBag, Eye, EyeOff, 
    ChevronRight, ShieldCheck, Star, Loader2, ArrowLeft,
    CheckCircle2, XCircle, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import "./CustomerAuth.css";

const CustomerAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { login, register, isAuthenticated } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="elite-auth-portal">
            {/* Ambient Background Elements */}
            <div className="portal-glow pg-1"></div>
            <div className="portal-glow pg-2"></div>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="premium-auth-container-luxe"
            >
                {/* Left Side: Visual Hero (Desktop Only) */}
                <div className="auth-visual-sector">
                    <div className="visual-overlay-luxe">
                        <div className="brand-elite-auth">
                            <ShoppingBag size={24} />
                            <span>Ecom360 Royale</span>
                        </div>
                        
                        <div className="visual-content-luxe">
                            <motion.div
                                key={isLogin ? 'l-v' : 's-v'}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <h1 className="hero-title-luxe">
                                    {isLogin ? "Experience the Zenith." : "Unlock Elite Privileges."}
                                </h1>
                                <p className="hero-desc-luxe">
                                    {isLogin 
                                        ? "Welcome back to your personalized sanctuary of luxury assets and seamless procurement." 
                                        : "Join the most exclusive shopping circle. Advanced logistics, priority access, and absolute security."}
                                </p>
                            </motion.div>
                            
                            <div className="hero-stats-luxe">
                                <div className="stat-item-luxe">
                                    <Star size={16} fill="#fbbf24" />
                                    <span>Premium Collections</span>
                                </div>
                                <div className="stat-item-luxe">
                                    <ShieldCheck size={16} />
                                    <span>Secured Tier</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="visual-bg-texture"></div>
                </div>

                {/* Right Side: Interactive Forms */}
                <div className="auth-form-sector">
                    <div className="form-header-luxe">
                        <div className="tabs-luxe-nav">
                            <button 
                                className={`tab-luxe-btn ${isLogin ? 'active' : ''}`}
                                onClick={() => setIsLogin(true)}
                            >
                                SIGN IN
                                {isLogin && <motion.div layoutId="tabUnderline" className="tab-underline-luxe" />}
                            </button>
                            <button 
                                className={`tab-luxe-btn ${!isLogin ? 'active' : ''}`}
                                onClick={() => setIsLogin(false)}
                            >
                                JOIN NOW
                                {!isLogin && <motion.div layoutId="tabUnderline" className="tab-underline-luxe" />}
                            </button>
                        </div>
                    </div>

                    <div className="form-viewport-luxe">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'register'}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3 }}
                                className="view-wrapper-luxe"
                            >
                                {isLogin ? (
                                    <LoginForm onSwitch={() => setIsLogin(false)} />
                                ) : (
                                    <RegisterForm onSwitch={() => setIsLogin(true)} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="form-footer-luxe">
                        <button onClick={() => navigate("/")} className="guest-link-luxe">
                           Continue as Guest <ChevronRight size={14} />
                        </button>
                        <p className="copyright-luxe">© 2026 Ecom360 Royale. All Assets Encrypted.</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const LoginForm = ({ onSwitch }) => {
    const { login } = useUser();
    const [formData, setFormData] = useState({ mobile_number: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.mobile_number || !formData.password) {
            setMsg({ type: "error", text: "Please enter your credentials" });
            return;
        }
        setIsLoading(true);
        setMsg({ type: "", text: "" });
        try {
            await login(formData.mobile_number, formData.password);
        } catch (err) {
            setMsg({ type: "error", text: "Access Restricted. Check your credentials." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="premium-form-luxe">
            <div className="greet-block-luxe">
                <h2 className="greet-title">Member Access</h2>
                <p className="greet-text">Enter your secure credentials to proceed.</p>
            </div>

            <div className="inputs-stack-luxe">
                <ModernInput 
                    icon={Phone} 
                    label="Mobile Number" 
                    type="tel" 
                    placeholder="Enter registered mobile"
                    value={formData.mobile_number}
                    onChange={(val) => setFormData({ ...formData, mobile_number: val })}
                />
                <ModernInput 
                    icon={Lock} 
                    label="Secret Password" 
                    type={showPass ? "text" : "password"} 
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(val) => setFormData({ ...formData, password: val })}
                    trailing={
                        <button type="button" className="eye-btn-luxe" onClick={() => setShowPass(!showPass)}>
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    }
                />
            </div>

            <div className="form-utils-luxe">
                <label className="checkbox-luxe">
                    <input type="checkbox" />
                    <span>Secure Session Persistent</span>
                </label>
                <button type="button" className="forgot-btn-luxe">Reset Credentials?</button>
            </div>

            {msg.text && (
                <div className={`form-alert-luxe ${msg.type}`}>
                    {msg.type === 'error' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                    <span>{msg.text}</span>
                </div>
            )}

            <button
                type="submit"
                className={`btn-auth-submit-luxe ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="spin" size={20} /> : "SIGN IN TO PORTAL"}
            </button>

            <div className="social-auth-sector">
                <div className="divider-luxe"><span>QUICK ACCESS</span></div>
                <div className="social-grid-luxe">
                    <button type="button" className="social-pill"><Mail size={18} /></button>
                    <button type="button" className="social-pill middle"><Sparkles size={18} /></button>
                    <button type="button" className="social-pill last">G</button>
                </div>
            </div>
        </form>
    );
};

const RegisterForm = ({ onSwitch }) => {
    const { register } = useUser();
    const [formData, setFormData] = useState({
        username: "", email: "", mobile_number: "", password: ""
    });
    const [confirmPass, setConfirmPass] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    const handleSignup = async (e) => {
        e.preventDefault();
        if (formData.password !== confirmPass) {
            setMsg({ type: "error", text: "Password integrity mismatch" });
            return;
        }
        setIsLoading(true);
        try {
            const payload = { ...formData, mobile: formData.mobile_number, role: "customer" };
            await register(payload);
            setMsg({ type: "success", text: "Identity Verified. Membership Initialized." });
            setTimeout(() => onSwitch(), 2000);
        } catch (err) {
            setMsg({ type: "error", text: "Registration Denied. Connection failed." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSignup} className="premium-form-luxe">
            <div className="greet-block-luxe">
                <h2 className="greet-title">Join the Elite</h2>
                <p className="greet-text">Initialize your premium membership certificate.</p>
            </div>

            <div className="inputs-grid-luxe">
                <ModernInput 
                    icon={User} label="Full Name" placeholder="Asset Holder Name"
                    value={formData.username}
                    onChange={(val) => setFormData({ ...formData, username: val })}
                />
                <ModernInput 
                    icon={Mail} label="Secure Email" placeholder="Private Mail Channel"
                    value={formData.email}
                    onChange={(val) => setFormData({ ...formData, email: val })}
                />
            </div>

            <ModernInput 
                icon={Phone} label="Contact Terminal" placeholder="+91 XXXXX XXXXX"
                value={formData.mobile_number}
                onChange={(val) => setFormData({ ...formData, mobile_number: val })}
            />

            <div className="inputs-grid-luxe">
                <ModernInput 
                    icon={Lock} label="Access Key" type="password" placeholder="Min 8 Chars"
                    value={formData.password}
                    onChange={(val) => setFormData({ ...formData, password: val })}
                />
                <ModernInput 
                    icon={ShieldCheck} label="Verify Key" type="password" placeholder="Repeat Key"
                    value={confirmPass}
                    onChange={(val) => setConfirmPass(val)}
                />
            </div>

            {msg.text && (
                <div className={`form-alert-luxe ${msg.type}`}>
                    {msg.type === 'error' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                    <span>{msg.text}</span>
                </div>
            )}

            <button
                type="submit"
                className={`btn-auth-submit-luxe register ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="spin" size={20} /> : "INITIALIZE MEMBERSHIP"}
            </button>
        </form>
    );
};

const ModernInput = ({ icon: Icon, label, value, onChange, type="text", placeholder, trailing }) => {
    return (
        <div className="modern-field-luxe">
            <span className="field-label-luxe">{label}</span>
            <div className="field-body-luxe">
                <Icon size={18} className="field-icon-luxe" />
                <input 
                    type={type} 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="field-input-luxe"
                    autoComplete="off"
                />
                {trailing && <div className="field-trailing-luxe">{trailing}</div>}
            </div>
        </div>
    );
};

export default CustomerAuth;