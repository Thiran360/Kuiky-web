import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../context/UserContext"; // Path adjusted
import { profileService } from "../../api/profileService"; // Path adjusted
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
} from "lucide-react";
import "./Profile.css";

const ADDRESS_SEPARATOR = ", ";

const Profile = () => {
  const { user, accessToken, handleLoginSuccess } = useUser();
  const [mode, setMode] = useState("view"); // "view", "edit"
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

  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    if (!user) return;

    const parts = (user.user_address || "")
      .split(ADDRESS_SEPARATOR)
      .map((p) => p.trim());

    setFormData({
      username: user.username || user.first_name || "",
      mobile_number: user.mobile_number || user.phone || "",
      email: user.email || "",
      address_line1: parts[0] || "",
      address_line2: parts[1] || "",
      city: parts[2] || "",
      state: parts[3] || "",
      pincode: parts[4] || "",
    });
  }, [user, mode]);

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

      const response = await profileService.updateProfile(payload);
      const updatedUserData = response.user || response;

      handleLoginSuccess({
        access: accessToken,
        user: updatedUserData,
      });

      setShowSuccess(true);
      setMode("view");
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Profile update failed. Please try again.");
    }
  };

  if (!user) return <div className="p-10">Please Login to View Profile</div>;

  return (
    <div className="profile-wrapper">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="success-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <CheckCircle size={20} />
            Profile updated successfully
          </motion.div>
        )}
      </AnimatePresence>

      <div className="profile-container">
        <div className="profile-header-main">
          <div className="profile-identity">
            <h1 className="profile-name">{user.username || user.first_name}</h1>
            <div className="profile-role-badge">
              <Shield size={14} />
              <span>Verified Customer Profile</span>
            </div>
          </div>
        </div>

        <div className="profile-controls">
          <div className="profile-nav-tabs">
            <button className="nav-tab active">General Information</button>
            <button className="nav-tab">Manage Addresses</button>
          </div>

          <div className="action-buttons">
            {mode === "edit" ? (
              <button className="premium-action-btn cancel-btn" onClick={() => setMode("view")}>
                <X size={18} /> Cancel Edit
              </button>
            ) : (
              <button className="premium-action-btn edit-btn" onClick={() => setMode("edit")}>
                <Pencil size={18} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="profile-content">
          {mode === "view" ? (
            <div className="info-grid">
              <PremiumInfoCard icon={<User size={20} />} label="Username" value={formData.username} />
              <PremiumInfoCard icon={<Phone size={20} />} label="Mobile Number" value={formData.mobile_number} />
              <div className="full-width-field">
                <PremiumInfoCard icon={<Mail size={20} />} label="Email Address" value={formData.email} />
              </div>
              <div className="full-width-field">
                <PremiumInfoCard icon={<MapPin size={20} />} label="Associated Address" value={user.user_address || "No address set"} />
              </div>
            </div>
          ) : (
            <div className="edit-form">
              <PremiumInputField label="Username" icon={<User size={18} />} value={formData.username} onChange={handleChange("username")} />
              <PremiumInputField label="Mobile" icon={<Phone size={18} />} value={formData.mobile_number} onChange={handleChange("mobile_number")} />
              <div className="full-width-field">
                <PremiumInputField label="Email" icon={<Mail size={18} />} value={formData.email} onChange={handleChange("email")} />
              </div>

              <div className="form-divider">Location Details (Optional Sync)</div>
              <PremiumInputField label="House / Flat No" icon={<Home size={18} />} value={formData.address_line1} onChange={handleChange("address_line1")} />
              <PremiumInputField label="Street / Area" icon={<Building size={18} />} value={formData.address_line2} onChange={handleChange("address_line2")} />
              <PremiumInputField label="City" icon={<Map size={18} />} value={formData.city} onChange={handleChange("city")} />
              <PremiumInputField label="State" icon={<MapPin size={18} />} value={formData.state} onChange={handleChange("state")} />
              <PremiumInputField label="Pincode" icon={<Hash size={18} />} value={formData.pincode} onChange={handleChange("pincode")} />

              <button className="save-changes-btn" onClick={handleSave}>
                <Save size={20} /> Update Profile Information
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PremiumInfoCard = ({ icon, label, value }) => (
  <div className="premium-info-card">
    <div className="icon-box">{icon}</div>
    <div className="info-details">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || "-"}</span>
    </div>
  </div>
);

const PremiumInputField = ({ label, icon, value, onChange }) => (
  <div className="input-field-group">
    <label>{label}</label>
    <div className="premium-input-wrapper">
      <span className="input-prefix-icon">{icon}</span>
      <input value={value} onChange={onChange} spellCheck="false" autoComplete="off" />
    </div>
  </div>
);

export default Profile;