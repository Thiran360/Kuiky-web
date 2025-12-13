import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../context/UserContext";
import { profileService } from "../api/profileService";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  Pencil,
  Save,
  X,
  CheckCircle,
  Home,
  Building,
  Map,
  Hash,
} from "lucide-react";
import "./Profile.css";

/* ✅ STATIC PROFILE IMAGE */
import profileImg from "../assets/image.png";

const ADDRESS_SEPARATOR = ", ";

const Profile = () => {
  const { user, accessToken, handleLoginSuccess } = useUser();
  const [mode, setMode] = useState("view");
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
      username: user.username || "",
      mobile_number: user.mobile_number || "",
      email: user.email || "",
      address_line1: parts[0] || "",
      address_line2: parts[1] || "",
      city: parts[2] || "",
      state: parts[3] || "",
      pincode: parts[4] || "",
    });
  }, [user]);

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
        .join(` ${ADDRESS_SEPARATOR} `);

      const payload = {
        username: formData.username,
        mobile_number: formData.mobile_number,
        email: formData.email,
        user_address: combinedAddress,
      };

      const updatedUser = await profileService.updateProfile(payload);

      handleLoginSuccess({
        access: accessToken,
        user: updatedUser.user,
      });

      setShowSuccess(true);
      setMode("view");
      setTimeout(() => setShowSuccess(false), 2500);
    } catch {
      alert("Profile update failed");
    }
  };

  if (!user) return null;

  /* ---------------- RENDER ---------------- */
  return (
    <>
      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="success-toast"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <CheckCircle size={18} />
            Profile updated
          </motion.div>
        )}
      </AnimatePresence>

      <div className="profile-wrapper">
        <div className="profile-container">
          {/* HEADER */}
          <div className="profile-header">
            <div className="avatar-wrapper">
              <div className="avatar-circle">
                <img src={profileImg} alt="Profile" className="avatar-image" />
              </div>
              <div className="avatar-badge">
                <Shield size={12} />
              </div>
            </div>

            <h1 className="profile-name">{user.username}</h1>

            <div className="profile-role">
              <Shield size={12} />
              Verified Customer
            </div>

            <button
              className={mode === "view" ? "edit-btn" : "cancel-btn"}
              onClick={() => setMode(mode === "view" ? "edit" : "view")}
            >
              {mode === "view" ? (
                <>
                  <Pencil size={14} /> Edit Profile
                </>
              ) : (
                <>
                  <X size={14} /> Cancel
                </>
              )}
            </button>
          </div>

          {/* CONTENT */}
          <div className="profile-content">
            {mode === "view" ? (
              <>
                <ProfileItem icon={<User size={16} />} label="Username" value={user.username} />
                <ProfileItem icon={<Phone size={16} />} label="Mobile" value={user.mobile_number} />
                <ProfileItem icon={<Mail size={16} />} label="Email" value={user.email} />
                <ProfileItem icon={<MapPin size={16} />} label="Address" value={user.user_address} />
              </>
            ) : (
              <>
                <InputField label="Username" icon={<User size={14} />} value={formData.username} onChange={handleChange("username")} />
                <InputField label="Mobile" icon={<Phone size={14} />} value={formData.mobile_number} onChange={handleChange("mobile_number")} />
                <InputField label="Email" icon={<Mail size={14} />} value={formData.email} onChange={handleChange("email")} />

                <InputField label="House / Flat No" icon={<Home size={14} />} value={formData.address_line1} onChange={handleChange("address_line1")} />
                <InputField label="Street / Area" icon={<Building size={14} />} value={formData.address_line2} onChange={handleChange("address_line2")} />
                <InputField label="City" icon={<Map size={14} />} value={formData.city} onChange={handleChange("city")} />
                <InputField label="State" icon={<MapPin size={14} />} value={formData.state} onChange={handleChange("state")} />
                <InputField label="Pincode" icon={<Hash size={14} />} value={formData.pincode} onChange={handleChange("pincode")} />

                <button className="save-btn" onClick={handleSave}>
                  <Save size={16} /> Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* ---------------- SUB COMPONENTS ---------------- */

const ProfileItem = ({ icon, label, value }) => (
  <div className="profile-item">
    <div className="item-icon-wrapper">{icon}</div>
    <div>
      <div className="item-label">{label}</div>
      <div className="item-value">{value || "-"}</div>
    </div>
  </div>
);

const InputField = ({ label, icon, value, onChange }) => (
  <div className="input-group">
    <label>{label}</label>
    <div className="input-wrapper">
      <span className="input-icon">{icon}</span>
      <input value={value} onChange={onChange} />
    </div>
  </div>
);

export default Profile;
