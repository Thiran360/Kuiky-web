import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useUser } from "../context/UserContext";
import Header from "../components/layout/Header";
import { profileService } from "../api/profileService";
import { User, Phone, Mail, MapPin, Shield, Pencil, Save, X } from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const { user, accessToken, handleLoginSuccess } = useUser();

  const [mode, setMode] = useState("view");       // FIXED
  const [showSuccess, setShowSuccess] = useState(false); // FIXED
  const [formData, setFormData] = useState({
    username: "",
    mobile_number: "",
    email: "",
    user_address: "",
  });

  // Initialize formData when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        mobile_number: user.mobile_number || "",
        email: user.email || "",
        user_address: user.user_address || "",
      });
    }
  }, [user]); // FIXED DEPENDENCIES

  const handleChange = useCallback(
    (key) => (e) => {
      setFormData((prev) => ({
        ...prev,
        [key]: e.target.value,    // FIXED
      }));
    },
    []
  );

  const handleSave = async () => {
    try {
      const payload = {
        username: formData.username,
        mobile_number: formData.mobile_number,
        email: formData.email,
        user_address: formData.user_address,
      };

      // PUT request → returns { message, user }
      const updatedUser = await profileService.updateProfile(payload);

      // CRITICAL FIX: updatedUser.user is the real object
      handleLoginSuccess({
        access: accessToken,
        user: updatedUser.user,  // FIXED
      });

      setShowSuccess(true);
      setMode("view");

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed.");
    }
  };

  if (!user) {
    return (
      <>
        <div className="profile-wrapper">
          <p>Loading profile data or user not logged in...</p>
        </div>
      </>
    );
  }

  const profileToDisplay = user;

  return (
    <>

      {showSuccess && (
        <motion.div
          className="success-message"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          Profile updated successfully!
        </motion.div>
      )}

      <div className="profile-wrapper">
        <motion.div
          className="profile-container"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* TOP */}
          <div className="profile-top">
            <div className="avatar-circle">
              <User size={70} />
            </div>

            <h2 className="profile-name">{profileToDisplay.username}</h2>

            <p className="profile-role">
              <Shield size={16} /> Customer
            </p>

            {mode === "view" ? (
              <button className="edit-btn" onClick={() => setMode("edit")}>
                <Pencil size={16} /> Edit Profile
              </button>
            ) : (
              <button className="cancel-btn" onClick={() => setMode("view")}>
                <X size={16} /> Cancel
              </button>
            )}
          </div>

          {/* VIEW MODE */}
          {mode === "view" && (
            <div className="profile-info">
              <ProfileItem label="Full Name" value={profileToDisplay.username} icon={<User />} />
              <ProfileItem label="Mobile Number" value={profileToDisplay.mobile_number} icon={<Phone />} />
              <ProfileItem label="Email" value={profileToDisplay.email} icon={<Mail />} />
              <ProfileItem label="Address" value={profileToDisplay.user_address || "Not provided"} icon={<MapPin />} />
            </div>
          )}

          {/* EDIT MODE */}
          {mode === "edit" && (
            <motion.div className="edit-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <InputField label="Full Name" icon={<User />} value={formData.username} onChange={handleChange("username")} />
              <InputField label="Mobile Number" icon={<Phone />} value={formData.mobile_number} onChange={handleChange("mobile_number")} />
              <InputField label="Email" icon={<Mail />} value={formData.email} onChange={handleChange("email")} />
              <InputField label="Address" icon={<MapPin />} value={formData.user_address} onChange={handleChange("user_address")} isTextarea />

              <motion.button className="save-btn" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSave}>
                <Save size={18} /> Save
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
};

const ProfileItem = ({ icon, label, value }) => (
  <motion.div className="profile-item">
    <div className="item-icon">{icon}</div>
    <div>
      <p className="item-label">{label}</p>
      <p className="item-value">{value}</p>
    </div>
  </motion.div>
);

const InputField = ({ label, icon, value, onChange, isTextarea }) => (
  <div className="input-group">
    <label>{label}</label>
    <div className="input-box">
      <span className="input-icon">{icon}</span>
      {isTextarea ? (
        <textarea rows={3} value={value} onChange={onChange} />
      ) : (
        <input value={value} onChange={onChange} />
      )}
    </div>
  </div>
);

export default Profile;
