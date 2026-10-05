/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Phone, ShieldCheck, Zap, Clock, Loader2,
    CheckCircle2, XCircle, Edit3, ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { authService } from "../../api/authService";
import "./CustomerAuth.css";

const CustomerAuth = () => {
    const { isAuthenticated } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="elite-auth-portal">
            {/* Ambient Background Glows */}
            <div className="portal-glow pg-1"></div>
            <div className="portal-glow pg-2"></div>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="premium-auth-container-luxe"
            >
                {/* Left Side: Kuiky Visual Hero (Desktop Only) */}
                <div className="auth-visual-sector">
                    <div className="visual-overlay-luxe">
                        <div className="brand-elite-auth">
                            <img 
                                src="/kuiky-logo-dark.png" 
                                alt="Kuiky - Quick Help, Anytime" 
                                style={{ height: "46px", objectFit: "contain" }} 
                            />
                        </div>
                        
                        <div className="visual-content-luxe">
                            <div>
                                <div className="kuiky-badge-pill">
                                    <span className="pulse-dot"></span>
                                    <span>24/7 ON-DEMAND PLATFORM</span>
                                </div>
                                <h1 className="hero-title-luxe">
                                    Quick Help, <br />
                                    <span className="hero-title-accent">Anytime.</span>
                                </h1>
                                <p className="hero-desc-luxe">
                                    Your instant access to emergency care, auto rides, roadside assistance, and seamless doorstep deliveries.
                                </p>
                            </div>
                            
                            <div className="hero-stats-luxe">
                                <div className="stat-item-luxe">
                                    <Zap size={16} className="stat-icon-green" />
                                    <span>Instant Dispatch</span>
                                </div>
                                <div className="stat-item-luxe">
                                    <ShieldCheck size={16} className="stat-icon-green" />
                                    <span>100% Verified</span>
                                </div>
                                <div className="stat-item-luxe">
                                    <Clock size={16} className="stat-icon-green" />
                                    <span>24/7 Priority</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="visual-bg-texture"></div>
                </div>

                {/* Right Side: Interactive Forms */}
                <div className="auth-form-sector">
                    {/* Mobile Only Brand Header */}
                    <div className="mobile-brand-header">
                        <img 
                            src="/kuiky-logo-dark.png" 
                            alt="Kuiky" 
                            style={{ height: "36px", objectFit: "contain" }} 
                        />
                    </div>

                    <div className="form-header-luxe">
                        <div className="tabs-luxe-nav">
                            <button className="tab-luxe-btn active">
                                SIGN IN
                                <div className="tab-underline-luxe" />
                            </button>
                        </div>
                    </div>

                    <div className="form-viewport-luxe">
                        <div className="view-wrapper-luxe">
                            <LoginForm />
                        </div>
                    </div>

                    <div className="form-footer-luxe">
                        <p className="copyright-luxe">© 2026 Kuiky • All Transactions Encrypted</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const LoginForm = () => {
    const { loginWithOtp, handleLoginSuccess } = useUser();
    const navigate = useNavigate();

    // Step state: "phone" or "otp"
    const [step, setStep] = useState("phone");
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });
    const [resendTimer, setResendTimer] = useState(30);

    const otpInputsRef = useRef([]);

    // Countdown timer for Resend OTP
    useEffect(() => {
        let interval = null;
        if (step === "otp" && resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [step, resendTimer]);

    // Auto-focus first box when switching to OTP step
    useEffect(() => {
        if (step === "otp" && otpInputsRef.current[0]) {
            setTimeout(() => {
                otpInputsRef.current[0]?.focus();
            }, 150);
        }
    }, [step]);

    // Handle sending OTP via backend API /ecomapp/send-otp/
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        const cleanNumber = mobileNumber.replace(/\D/g, "");

        if (cleanNumber.length !== 10) {
            setMsg({ type: "error", text: "Please enter a valid 10-digit mobile number" });
            return;
        }

        setIsLoading(true);
        setMsg({ type: "", text: "" });

        try {
            await authService.sendOtp(cleanNumber);
            setStep("otp");
            setOtp(["", "", "", "", "", ""]);
            setResendTimer(30);
            setMsg({ 
                type: "success", 
                text: `OTP sent successfully to +91 ${cleanNumber}!` 
            });
        } catch (err) {
            setMsg({ 
                type: "error", 
                text: err.message || "Failed to send OTP. Please try again." 
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Resend OTP via backend API
    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        const cleanNumber = mobileNumber.replace(/\D/g, "");
        setIsLoading(true);
        setMsg({ type: "", text: "" });

        try {
            await authService.sendOtp(cleanNumber);
            setOtp(["", "", "", "", "", ""]);
            setResendTimer(30);
            setMsg({ 
                type: "success", 
                text: `New OTP sent to +91 ${cleanNumber}!` 
            });
            if (otpInputsRef.current[0]) {
                otpInputsRef.current[0].focus();
            }
        } catch (err) {
            setMsg({ 
                type: "error", 
                text: err.message || "Failed to resend OTP. Please try again." 
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle OTP Box digit input (6 digits)
    const handleOtpChange = (val, index) => {
        const digit = val.replace(/\D/g, "").slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        if (digit && index < 5) {
            otpInputsRef.current[index + 1]?.focus();
        }

        // Auto verify once 6 digits entered
        if (digit && index === 5) {
            const fullOtp = newOtp.join("");
            if (fullOtp.length === 6) {
                executeLogin(fullOtp);
            }
        }
    };

    // Handle KeyDown (Backspace & Arrow Navigation)
    const handleOtpKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                otpInputsRef.current[index - 1]?.focus();
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            otpInputsRef.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < 5) {
            otpInputsRef.current[index + 1]?.focus();
        }
    };

    // Handle Paste into OTP box
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pastedData) return;

        const newOtp = ["", "", "", "", "", ""];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        const nextFocus = Math.min(pastedData.length, 5);
        otpInputsRef.current[nextFocus]?.focus();

        if (pastedData.length === 6) {
            executeLogin(pastedData);
        }
    };

    // Verify & Login via backend API /ecomapp/verify-otp/
    const executeLogin = async (otpCode) => {
        const code = otpCode || otp.join("");
        if (code.length < 6) {
            setMsg({ type: "error", text: "Please enter the full 6-digit OTP" });
            return;
        }

        setIsLoading(true);
        setMsg({ type: "", text: "" });

        try {
            await loginWithOtp(mobileNumber, code);
            navigate("/", { replace: true });
        } catch (err) {
            setMsg({ 
                type: "error", 
                text: err.message || "Invalid verification code. Please try again." 
            });
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        executeLogin();
    };

    return (
        <div className="premium-form-luxe">
            <AnimatePresence mode="wait">
                {step === "phone" ? (
                    <motion.form 
                        key="phone-step"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        onSubmit={handleSendOtp}
                    >
                        <div className="greet-block-luxe">
                            <h2 className="greet-title">Member Access</h2>
                            <p className="greet-text">Enter your mobile number to receive an instant OTP.</p>
                        </div>

                        <div className="inputs-stack-luxe">
                            <div className="modern-field-luxe">
                                <span className="field-label-luxe">MOBILE NUMBER</span>
                                <div className="field-body-luxe">
                                    <Phone size={18} className="field-icon-luxe" />
                                    <div className="phone-prefix-tag">+91</div>
                                    <input 
                                        type="tel" 
                                        value={mobileNumber} 
                                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                        placeholder="Enter 10-digit number"
                                        className="field-input-luxe"
                                        autoComplete="tel"
                                        autoFocus
                                    />
                                </div>
                            </div>
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
                            disabled={isLoading || mobileNumber.replace(/\D/g, "").length !== 10}
                        >
                            {isLoading ? (
                                <Loader2 className="spin" size={20} />
                            ) : (
                                <>
                                    <span>GET OTP</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </motion.form>
                ) : (
                    <motion.form 
                        key="otp-step"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        onSubmit={handleOtpSubmit}
                    >
                        <div className="greet-block-luxe">
                            <h2 className="greet-title">Verify OTP</h2>
                            <p className="greet-text">Enter the 6-digit code sent to your mobile.</p>
                        </div>

                        {/* Verified Mobile Number Card */}
                        <div className="otp-phone-card">
                            <div className="otp-phone-details">
                                <Phone size={15} className="otp-card-icon" />
                                <span className="otp-card-number">+91 {mobileNumber}</span>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => { setStep("phone"); setMsg({ type: "", text: "" }); }}
                                className="otp-card-edit"
                            >
                                <Edit3 size={13} /> Change
                            </button>
                        </div>

                        {/* Box Shape OTP Inputs (6 boxes) */}
                        <div className="otp-boxes-grid">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (otpInputsRef.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(e.target.value, index)}
                                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                    onPaste={handleOtpPaste}
                                    className={`otp-digit-box ${digit ? "filled" : ""}`}
                                    autoComplete="one-time-code"
                                />
                            ))}
                        </div>

                        <div className="otp-resend-row">
                            <span>Didn't receive the OTP? </span>
                            {resendTimer > 0 ? (
                                <span className="otp-timer-text">Resend in <strong>{resendTimer}s</strong></span>
                            ) : (
                                <button type="button" onClick={handleResendOtp} className="otp-resend-action">
                                    Resend OTP
                                </button>
                            )}
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
                            disabled={isLoading || otp.join("").length !== 6}
                        >
                            {isLoading ? <Loader2 className="spin" size={20} /> : "SIGN IN TO KUIKY"}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomerAuth;