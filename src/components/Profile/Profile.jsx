// src/pages/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { User, Package, Heart, Power, Folder, ChevronRight, Wallet } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, loading, updateUserProfile } = useProfile();
  
  // Local state for form editing
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    email: '',
    phone: ''
  });

  // Sync context user data to local form state
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        gender: user.gender || 'Male',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const result = await updateUserProfile(formData);
    if (result.success) {
      setIsEditing(false);
      // Optional: Add toast success message here
    }
  };

  const handleCancel = () => {
    // Revert changes
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        email: user.email,
        phone: user.phone
      });
    }
    setIsEditing(false);
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading Profile...</div>;

  return (
    <>
    
    <div className="profile-page-wrapper">
      <div className="profile-container">
        
        {/* --- LEFT SIDEBAR --- */}
        <div className="profile-sidebar">
          {/* Hello User Card */}
          <div className="user-hello-card">
            <img 
              src={user?.avatar || "https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/profile-pic-male_4811a1.svg"} 
              alt="User" 
              className="user-avatar" 
            />
            <div>
              <div className="hello-text">Hello,</div>
              <div className="user-name-bold">{user?.firstName} {user?.lastName}</div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="sidebar-menu">
            <div className="menu-group">
              <div className="menu-header">
                <Package size={18} className="menu-icon" /> &nbsp; MY ORDERS
              </div>
            </div>

            <div className="menu-group">
              <div className="menu-header">
                <User size={18} className="menu-icon" /> &nbsp; ACCOUNT SETTINGS
              </div>
              <a className="menu-item active">Profile Information</a>
              <a className="menu-item">Manage Addresses</a>
              <a className="menu-item">PAN Card Information</a>
            </div>

            <div className="menu-group">
              <div className="menu-header">
                <Wallet size={18} className="menu-icon" /> &nbsp; PAYMENTS
              </div>
              <a className="menu-item">Gift Cards</a>
              <a className="menu-item">Saved UPI</a>
              <a className="menu-item">Saved Cards</a>
            </div>

            <div className="menu-group">
              <div className="menu-header">
                <Folder size={18} className="menu-icon" /> &nbsp; MY STUFF
              </div>
              <a className="menu-item">My Coupons</a>
              <a className="menu-item">My Reviews & Ratings</a>
              <a className="menu-item">All Notifications</a>
              <a className="menu-item">My Wishlist</a>
            </div>

             <div className="menu-group">
              <div className="menu-header" style={{cursor:'pointer', color: '#2874f0'}}>
                <Power size={18} className="menu-icon" /> &nbsp; LOGOUT
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT MAIN CONTENT --- */}
        <div className="profile-content">
          
          {/* Personal Information Section */}
          <div className="form-group">
            <div className="section-header">
              <span className="section-title">Personal Information</span>
              {!isEditing && (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
              )}
            </div>

            <div className="input-row">
              <div className="input-container">
                {isEditing && <label className="input-label">First Name</label>}
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="fk-input" 
                  disabled={!isEditing}
                />
              </div>
              <div className="input-container">
                {isEditing && <label className="input-label">Last Name</label>}
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="fk-input" 
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div className="radio-group" style={{marginTop: '20px'}}>
              <label className="input-label" style={{marginRight: '20px'}}>Your Gender</label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="gender" 
                  value="Male" 
                  checked={formData.gender === 'Male'} 
                  onChange={handleInputChange}
                  disabled={!isEditing}
                /> 
                Male
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="gender" 
                  value="Female" 
                  checked={formData.gender === 'Female'} 
                  onChange={handleInputChange}
                  disabled={!isEditing}
                /> 
                Female
              </label>
            </div>
          </div>

          {/* Email Address Section */}
          <div className="form-group">
             <div className="section-header">
              <span className="section-title">Email Address</span>
              {!isEditing && <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>}
            </div>
             <div className="input-row">
              <div className="input-container">
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="fk-input" 
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Mobile Number Section */}
          <div className="form-group">
             <div className="section-header">
              <span className="section-title">Mobile Number</span>
              {!isEditing && <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>}
            </div>
             <div className="input-row">
              <div className="input-container">
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="fk-input" 
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div style={{marginTop: '30px'}}>
              <button className="save-btn" onClick={handleSave}>SAVE</button>
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
            </div>
          )}

          {/* Footer Links */}
          <div className="faq-links">
            <div className="section-title" style={{fontSize: '14px', marginBottom: '15px'}}>FAQs</div>
            <a>What happens when I update my email address (or mobile number)?</a>
            <a>When will my account be updated with the new email address (or mobile number)?</a>
            <a>What happens to my existing account when I update my email address (or mobile number)?</a>
            <a style={{marginTop: '20px', fontWeight: '600'}}>Deactivate Account</a>
          </div>

        </div>
      </div>
    </div>
    </>
  );
};

export default Profile;