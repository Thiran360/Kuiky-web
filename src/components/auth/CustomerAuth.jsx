// src/components/auth/CustomerAuth.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Mail, Phone, Lock, User,
  CheckCircle2, XCircle, Loader2, ArrowRight,
  Truck, Gift
} from "lucide-react";

import "./CustomerAuth.css";

// API + Utilities
import { customerService } from "../../api/authService";
import { validateField } from "../../utils/validation";
import { useUser } from "../../context/UserContext";

import { useNavigate } from "react-router-dom";

const CustomerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      {/* Background blobs */}
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="blob blob-1"
      />
      <motion.div
        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="blob blob-2"
      />

      <div className="auth-card">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div>
            <div className="brand-header">
              <ShoppingBag size={28} />
              <span className="brand-text">ShopConnect</span>
            </div>
            <h1 className="hero-title">
              {isLogin ? "Welcome Back!" : "Join the Club."}
            </h1>
            <p className="hero-subtitle">
              {isLogin
                ? "Sign in to track orders, manage addresses, and view your wishlist."
                : "Create an account for exclusive deals, faster checkout, and rewards."}
            </p>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <Truck size={20} /> Fast Delivery
            </div>
            <div className="feature-item">
              <Gift size={20} /> Exclusive Member Deals
            </div>
            <div className="feature-item">
              <CheckCircle2 size={20} /> Easy Returns
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="form-header">
            <h2>{isLogin ? "Customer Login" : "Create Account"}</h2>
            <p>
              {isLogin
                ? "Enter your phone number and password."
                : "Fill in your details to get started."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <LoginForm key="login" switchToRegister={() => setIsLogin(false)} />
            ) : (
              <RegisterForm key="register" switchToLogin={() => setIsLogin(true)} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ==========================================
      LOGIN FORM
========================================== */
const LoginForm = ({ switchToRegister }) => {
  const [formData, setFormData] = useState({
    mobile_number: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { handleLoginSuccess } = useUser();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!formData.mobile_number || !formData.password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await customerService.login(
        formData.mobile_number,
        formData.password
      );

      // IMPORTANT → your login API returns { access, user }
      handleLoginSuccess({
        access: res.access,
        user: res.user,
      });

      navigate("/");
    } catch (err) {
      alert(err.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="form-stack"
      onSubmit={handleLoginSubmit}
    >
      <InputGroup
        icon={Phone}
        type="tel"
        placeholder="Enter Mobile Number"
        value={formData.mobile_number}
        onChange={(e) =>
          setFormData({ ...formData, mobile_number: e.target.value })
        }
      />

      <InputGroup
        icon={Lock}
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) =>
          setFormData({ ...formData, password: e.target.value })
        }
      />

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn-primary btn-black"
        disabled={loading}
      >
        {loading ? "Signing In..." : "Sign In"} <ArrowRight size={18} />
      </motion.button>

      <p className="switch-text">
        New here?{" "}
        <button type="button" onClick={switchToRegister} className="toggle-link">
          Create Account
        </button>
      </p>
    </motion.form>
  );
};

/* ==========================================
      REGISTER FORM
========================================== */
const RegisterForm = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile_number: "",
    password: "",
    latitude: "",
    longitude: "",
    user_address: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.username ||
      !formData.email ||
      !formData.mobile_number ||
      !formData.password
    ) {
      alert("Please fill all required fields");
      return;
    }

    setSubmitting(true);

    const payload = {
      username: formData.username,
      email: formData.email,
      mobile_number: formData.mobile_number,
      password: formData.password,
      role: "customer",
      ...(formData.latitude && { latitude: parseFloat(formData.latitude) }),
      ...(formData.longitude && { longitude: parseFloat(formData.longitude) }),
      ...(formData.user_address && { user_address: formData.user_address }),
    };

    try {
      await customerService.register(payload);

      alert("Account created successfully!");
      navigate("/login");
      switchToLogin();
    } catch (err) {
      alert("Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="form-stack"
      onSubmit={handleSubmit}
    >
      <InputGroup
        icon={User}
        type="text"
        placeholder="Full Name / Username"
        value={formData.username}
        onChange={(e) =>
          setFormData({ ...formData, username: e.target.value })
        }
      />

      {/* Email Validation */}
      <ValidatedInput
        icon={Mail}
        type="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={(e) =>
          setFormData({ ...formData, email: e.target.value })
        }
        validationType="email"
      />

      {/* Mobile Validation */}
      <ValidatedInput
        icon={Phone}
        type="tel"
        placeholder="Mobile Number"
        value={formData.mobile_number}
        onChange={(e) =>
          setFormData({ ...formData, mobile_number: e.target.value })
        }
        validationType="phone"
      />

      <InputGroup
        icon={Lock}
        type="password"
        placeholder="Create Password"
        value={formData.password}
        onChange={(e) =>
          setFormData({ ...formData, password: e.target.value })
        }
      />

      <InputGroup
        icon={Truck}
        type="text"
        placeholder="Full Address (Optional)"
        value={formData.user_address}
        onChange={(e) =>
          setFormData({ ...formData, user_address: e.target.value })
        }
      />

      <InputGroup
        icon={ArrowRight}
        type="number"
        placeholder="Latitude (Optional)"
        value={formData.latitude}
        onChange={(e) =>
          setFormData({ ...formData, latitude: e.target.value })
        }
      />

      <InputGroup
        icon={ArrowRight}
        type="number"
        placeholder="Longitude (Optional)"
        value={formData.longitude}
        onChange={(e) =>
          setFormData({ ...formData, longitude: e.target.value })
        }
      />

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn-primary btn-brand"
        disabled={submitting}
      >
        {submitting ? "Creating Account..." : "Sign Up"}
      </motion.button>

      <p className="switch-text">
        Already have an account?{" "}
        <button type="button" onClick={switchToLogin} className="toggle-link">
          Login
        </button>
      </p>
    </motion.form>
  );
};

/* ==========================================
      HELPER COMPONENTS
========================================== */
const ValidatedInput = ({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  validationType,
}) => {
  const [status, setStatus] = useState("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!value) {
        setStatus("idle");
        setMsg("");
        return;
      }

      // Validate format
      const isValidFormat = validateField(validationType, value);
      if (!isValidFormat) {
        setStatus("invalid");
        setMsg(`Invalid ${validationType}`);
        return;
      }

      setStatus("loading");

      try {
        const response = await customerService.checkAvailability(
          validationType,
          value
        );

        if (response.isAvailable) {
          setStatus("valid");
          setMsg("");
        } else {
          setStatus("duplicate");
          setMsg(`${validationType} already linked to an account`);
        }
      } catch {
        setStatus("valid");
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [value, validationType]);

  return (
    <div className="input-wrapper">
      <div className="input-icon">
        <Icon size={18} />
      </div>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`custom-input ${
          status === "valid"
            ? "valid"
            : status === "invalid"
            ? "invalid"
            : status === "duplicate"
            ? "duplicate"
            : ""
        }`}
      />

      <div className="status-icon">
        {status === "loading" && <Loader2 className="spin" size={18} />}
        {status === "valid" && <CheckCircle2 size={18} color="#22c55e" />}
        {(status === "invalid" || status === "duplicate") && (
          <XCircle size={18} color="#ef4444" />
        )}
      </div>

      <AnimatePresence>
        {(status === "invalid" || status === "duplicate") && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="validation-msg text-red"
          >
            {msg}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputGroup = ({ icon: Icon, type, placeholder, value, onChange }) => (
  <div className="input-wrapper">
    <div className="input-icon">
      <Icon size={18} />
    </div>

    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="custom-input"
    />
  </div>
);

export default CustomerAuth;
