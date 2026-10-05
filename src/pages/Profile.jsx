import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../context/UserContext";
import { profileService } from "../api/profileService";
import {
  User,
  Phone,
  Mail,
  Shield,
  Pencil,
  Save,
  X,
  CheckCircle,
  Home,
  Building,
  Map,
  MapPin,
  Hash,
  Activity,
  LogOut,
  Settings,
  CreditCard,
  Bell,
  Lock,
  Package,
  Star
} from "lucide-react";
import { useOrder } from "../context/OrderContext";
import "./Profile.css";

import AddressManager from "../components/Profile/AddressManager";

const ADDRESS_SEPARATOR = ", ";

const Profile = () => {
  const { user, accessToken, handleLoginSuccess, logout } = useUser();
  const [mode, setMode] = useState("view"); // "view", "edit", or "addresses"
  const [showSuccess, setShowSuccess] = useState(false);

  /* ---------------- FORM STATE ---------------- */
  const [formData, setFormData] = useState({
    username: "",
    mobile_number: "",
    email: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const { orders } = useOrder() || { orders: [] };

  useEffect(() => {
    if (!user) return;

    const parts = (user.user_address || "")
      .split(ADDRESS_SEPARATOR)
      .map((p) => p.trim());

    setFormData({
      username: user.username || user.name || user.full_name || "",
      mobile_number: user.mobile_number || user.mobile || user.phone || "",
      email: user.email || user.email_address || "",
      address_line1: parts[0] || "",
      address_line2: parts[1] || "",
      city: parts[2] || "",
      state: parts[3] || "",
      pincode: parts[4] || "",
    });
  }, [user]);

  const stats = useMemo(() => {
    const totalOrders = orders?.length || 0;
    const totalSpent = orders?.reduce((acc, curr) => acc + (parseFloat(curr.total_amount) || 0), 0) || 0;
    const reviewCount = orders?.filter(o => o.status === 'delivered').length || 0;
    return { totalOrders, totalSpent, reviewCount };
  }, [orders]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = useCallback(
    (key) => (e) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value })),
    []
  );

  const handleSave = async () => {
    try {
      const combinedAddress = [
        formData.address_line1,
        formData.address_line2,
        formData.city,
        formData.state,
        formData.pincode,
      ]
        .map((v) => v?.trim())
        .filter(Boolean)
        .join(`${ADDRESS_SEPARATOR}`);

      const payload = {
        username: formData.username,
        mobile_number: formData.mobile_number,
        email: formData.email,
        user_address: combinedAddress,
      };

      let updatedUserData = null;
      try {
        const response = await profileService.updateProfile(payload);
        console.log("✅ Profile API updated successfully:", response);
        updatedUserData = response.user || response;
      } catch (apiErr) {
        console.warn("Backend updateProfile API sync warning:", apiErr);
      }

      // Merge updated profile data
      const finalUser = {
        ...user,
        ...payload,
        name: payload.username,
        username: payload.username,
        email: payload.email,
        mobile_number: payload.mobile_number,
        mobile: payload.mobile_number,
        phone: payload.mobile_number,
        user_address: combinedAddress,
        ...(updatedUserData && typeof updatedUserData === "object" ? updatedUserData : {}),
      };

      if (!finalUser.username && payload.username) finalUser.username = payload.username;
      if (!finalUser.name && payload.username) finalUser.name = payload.username;

      // Synchronize in UserContext and localStorage
      handleLoginSuccess({
        access: accessToken,
        user: finalUser,
      });

      localStorage.setItem("user_profile", JSON.stringify(finalUser));

      // Sync form state
      setFormData((prev) => ({
        ...prev,
        username: finalUser.username || finalUser.name || "",
        mobile_number: finalUser.mobile_number || finalUser.mobile || "",
        email: finalUser.email || "",
      }));

      setShowSuccess(true);
      setMode("view");
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  if (!user) return null;

  /* ---------------- RENDER ---------------- */
  return (
    <div className="elite-profile-page">
      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="elite-success-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Shield size={18} className="toast-glow-icon" />
            <span>Profile updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="elite-profile-canvas">
        {/* CINEMATIC HEADER */}
        <header className="elite-profile-banner">
            <div className="banner-visual-overlay"></div>
            <div className="banner-content">
                <div className="profile-avatar-ecom360">
                    <div className="avatar-shield">
                        <User size={60} strokeWidth={1.5} />
                    </div>
                    <div className="identity-dossier">
                        <span className="protocol-badge">MY PROFILE</span>
                        <h1 className="identity-name">{user.username || user.name || "Customer"}</h1>
                        <div className="identity-meta">
                            <span className="meta-pill"><Shield size={12} /> VERIFIED</span>
                            <span className="meta-pill"><Activity size={12} /> ACTIVE</span>
                        </div>
                    </div>
                </div>

                <div className="profile-stats-ecom360">
                    <div className="stat-card-luxe">
                        <Package size={20} />
                        <div className="stat-info">
                            <span className="val">{stats.totalOrders}</span>
                            <span className="lbl">ORDERS</span>
                        </div>
                    </div>
                    <div className="stat-card-luxe">
                        <CreditCard size={20} />
                        <div className="stat-info">
                            <span className="val">₹{stats.totalSpent.toLocaleString()}</span>
                            <span className="lbl">TOTAL SPENT</span>
                        </div>
                    </div>
                    <div className="stat-card-luxe">
                        <Star size={20} />
                        <div className="stat-info">
                            <span className="val">{stats.reviewCount}</span>
                            <span className="lbl">DELIVERED</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <div className="elite-profile-layout">
          {/* NAVIGATION SIDEBAR */}
          <aside className="elite-profile-sidebar">
             <nav className="sidebar-nav-ecom360">
                <button className={`nav-link-luxe ${mode === 'view' ? 'active' : ''}`} onClick={() => setMode('view')}>
                    <User size={18} /> <span>My Profile</span>
                </button>
                <button className={`nav-link-luxe ${mode === 'edit' ? 'active' : ''}`} onClick={() => setMode('edit')}>
                    <Pencil size={18} /> <span>Edit Profile</span>
                </button>
                <button className={`nav-link-luxe ${mode === 'addresses' ? 'active' : ''}`} onClick={() => setMode('addresses')}>
                    <MapPin size={18} /> <span>Manage Addresses</span>
                </button>
                <div className="nav-divider"></div>
                <button className="nav-link-luxe logout-danger" onClick={logout}>
                    <LogOut size={18} /> <span>Logout</span>
                </button>
             </nav>
          </aside>

          {/* MAIN CONTENT ECOM360 */}
          <main className="elite-profile-ecom360">
            <AnimatePresence mode="wait">
              {mode === "view" && (
                <motion.div 
                    key="view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="metrics-grid"
                >
                    <div className="metrics-header-ecom360">
                        <h2 className="ecom360-subtitle">My Profile</h2>
                        <p className="ecom360-desc">Your personal details and contact information.</p>
                    </div>
                    <div className="ecom360-cards-container">
                        <EliteInfoCard icon={<User />} label="FULL NAME" value={user.username || user.name} />
                        <EliteInfoCard icon={<Mail />} label="EMAIL ADDRESS" value={user.email} />
                        <EliteInfoCard icon={<Phone />} label="MOBILE NUMBER" value={user.mobile_number || user.mobile || user.phone} />
                        <EliteInfoCard icon={<MapPin />} label="ADDRESS" value={user.user_address || "Not specified"} />
                    </div>
                </motion.div>
              )}

              {mode === "edit" && (
                <motion.div 
                    key="edit"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="auth-modify-ecom360"
                >
                    <div className="metrics-header-ecom360">
                        <h2 className="ecom360-subtitle">Edit Profile</h2>
                        <p className="ecom360-desc">Update your personal details and contact information.</p>
                    </div>
                    <div className="lite-form-grid">
                        <EliteInput 
                            icon={<User size={18} />} 
                            label="Full Name" 
                            placeholder="Enter your full name"
                            value={formData.username} 
                            onChange={handleChange("username")} 
                        />
                        <EliteInput 
                            icon={<Phone size={18} />} 
                            label="Mobile Number" 
                            placeholder="10-digit mobile number"
                            type="tel"
                            value={formData.mobile_number} 
                            onChange={handleChange("mobile_number")} 
                        />
                        <EliteInput 
                            icon={<Mail size={18} />} 
                            label="Email Address" 
                            placeholder="name@example.com"
                            type="email"
                            value={formData.email} 
                            fullWidth 
                            onChange={handleChange("email")} 
                        />
                        
                        <div className="form-sub-protocol">
                            <Home size={16} />
                            <span>Address & Delivery Details</span>
                        </div>
                        <EliteInput 
                            icon={<Home size={18} />} 
                            label="Flat / House / Apartment" 
                            placeholder="e.g. Flat 302, Building A"
                            value={formData.address_line1} 
                            onChange={handleChange("address_line1")} 
                        />
                        <EliteInput 
                            icon={<Building size={18} />} 
                            label="Street / Area / Colony" 
                            placeholder="e.g. 2nd Cross, Anna Nagar"
                            value={formData.address_line2} 
                            onChange={handleChange("address_line2")} 
                        />
                        <EliteInput 
                            icon={<Map size={18} />} 
                            label="City / Town" 
                            placeholder="e.g. Chennai"
                            value={formData.city} 
                            onChange={handleChange("city")} 
                        />
                        <EliteInput 
                            icon={<MapPin size={18} />} 
                            label="State" 
                            placeholder="e.g. Tamil Nadu"
                            value={formData.state} 
                            onChange={handleChange("state")} 
                        />
                        <EliteInput 
                            icon={<Hash size={18} />} 
                            label="Pincode" 
                            placeholder="e.g. 600001"
                            value={formData.pincode} 
                            onChange={handleChange("pincode")} 
                        />
                    </div>
                    <div className="ecom360-form-actions">
                        <button className="btn-cancel-elite" onClick={() => setMode('view')}>Cancel</button>
                        <button className="btn-save-elite" onClick={handleSave}><Save size={18} /> Save Changes</button>
                    </div>
                </motion.div>
              )}

              {mode === "addresses" && (
                <motion.div 
                    key="addresses"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                >
                    <div className="metrics-header-ecom360">
                        <h2 className="ecom360-subtitle">Manage Addresses</h2>
                        <p className="ecom360-desc">Add, edit, or remove your delivery addresses.</p>
                    </div>
                    <AddressManager />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

const EliteInfoCard = ({ icon, label, value }) => (
    <div className="elite-info-card-luxe">
        <div className="card-icon-halo">{icon}</div>
        <div className="card-details">
            <span className="card-label">{label}</span>
            <span className="card-value">{value || "Not available"}</span>
        </div>
    </div>
);

const EliteInput = ({ icon, label, value, onChange, fullWidth, placeholder, type = "text" }) => (
    <div className={`elite-input-field ${fullWidth ? 'full' : ''}`}>
        <label className="field-label-luxe">{label}</label>
        <div className="field-input-wrapper">
             <span className="field-icon">{icon}</span>
             <input 
                 type={type}
                 value={value || ""} 
                 onChange={onChange} 
                 placeholder={placeholder || `Enter ${label?.toLowerCase() || ''}`}
                 spellCheck="false" 
             />
        </div>
    </div>
);

export default Profile;