import React, { useState, useEffect, useCallback } from 'react';
import { useAddress } from '../../context/AddressContext';
import { Plus, MapPin, Edit, Trash2, Home, CheckCircle, Loader2, XCircle } from 'lucide-react';

// ---------------- ADDRESS FORM ----------------
const AddressForm = ({ initialData, onSubmit, onCancel, isSaving }) => {
    const [formData, setFormData] = useState(initialData || {
        full_name: "",
        phone_number: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
        is_default: false,
        latitude: "",
        longitude: "",
    });

    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const isEditMode = Boolean(initialData?.id);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            return;
        }

        setLocationLoading(true);
        setLocationError(null);
        setFormData(prev => ({ ...prev, latitude: "", longitude: "" }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString(),
                }));
                setLocationLoading(false);
            },
            (error) => {
                setLocationLoading(false);
                let msg = "Failed to get location.";
                if (error.code === error.PERMISSION_DENIED) {
                    msg = "Location access denied. Please enable it in your browser settings.";
                } else if (error.code === error.TIMEOUT) {
                    msg = "Timed out waiting for location.";
                }
                setLocationError(msg);
                setFormData(prev => ({ ...prev, latitude: "", longitude: "" }));
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.full_name || !formData.address_line_1 ||
            !formData.city || !formData.state || !formData.postal_code || !formData.country) {
            alert("Please fill in all required fields.");
            return;
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="address-form-box">
            <div className="form-header-row">
                <h3 className="form-header">{isEditMode ? "Edit Address" : "Add New Address"}</h3>
                <button type="button" onClick={onCancel} className="form-cancel-btn">
                    Cancel
                </button>
            </div>

            <div className="form-grid">
                <div className="form-field">
                    <label>Full Name *</label>
                    <input 
                        name="full_name" 
                        value={formData.full_name} 
                        onChange={handleChange}
                        placeholder="Enter full name" 
                        required 
                    />
                </div>

                <div className="form-field">
                    <label>Phone Number</label>
                    <input 
                        name="phone_number" 
                        value={formData.phone_number} 
                        onChange={handleChange}
                        placeholder="Enter phone number" 
                    />
                </div>

                <div className="form-field">
                    <label>Address Line 1 *</label>
                    <input 
                        name="address_line_1" 
                        value={formData.address_line_1} 
                        onChange={handleChange}
                        placeholder="House no., Building, Street" 
                        required 
                    />
                </div>

                <div className="form-field">
                    <label>Address Line 2 (Optional)</label>
                    <input 
                        name="address_line_2" 
                        value={formData.address_line_2} 
                        onChange={handleChange}
                        placeholder="Area, Locality" 
                    />
                </div>

                <div className="form-field">
                    <label>City *</label>
                    <input 
                        name="city" 
                        value={formData.city} 
                        onChange={handleChange}
                        placeholder="Enter city" 
                        required 
                    />
                </div>

                <div className="form-field">
                    <label>State *</label>
                    <input 
                        name="state" 
                        value={formData.state} 
                        onChange={handleChange}
                        placeholder="Enter state" 
                        required 
                    />
                </div>

                <div className="form-field">
                    <label>Postal Code *</label>
                    <input 
                        name="postal_code" 
                        value={formData.postal_code} 
                        onChange={handleChange}
                        placeholder="Enter postal code" 
                        required 
                    />
                </div>

                <div className="form-field">
                    <label>Country *</label>
                    <input 
                        name="country" 
                        value={formData.country} 
                        onChange={handleChange}
                        placeholder="Enter country" 
                        required 
                    />
                </div>
            </div>

            {/* Geolocation Button */}
            <div className="location-fetch-wrapper">
                <button
                    type="button"
                    className="btn-location"
                    onClick={handleGetLocation}
                    disabled={locationLoading || isSaving}
                >
                    {locationLoading ? (
                        <>
                            <Loader2 size={16} className="spin" /> Getting Location...
                        </>
                    ) : (
                        <>
                            <MapPin size={16} /> Use Current Location (Optional)
                        </>
                    )}
                </button>
                
                {formData.latitude && formData.longitude && !locationLoading ? (
                    <p className="location-status success">
                        <CheckCircle size={14} /> Lat: {parseFloat(formData.latitude).toFixed(4)}, Long: {parseFloat(formData.longitude).toFixed(4)}
                    </p>
                ) : locationError ? (
                    <p className="location-status error">
                        <XCircle size={14} /> {locationError}
                    </p>
                ) : null}
            </div>

            <div className="default-checkbox-wrapper">
                <label className="default-checkbox">
                    <input 
                        type="checkbox" 
                        name="is_default"
                        checked={formData.is_default} 
                        onChange={handleChange} 
                    />
                    Set as default shipping address
                </label>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn-primary-save" disabled={isSaving}>
                    {isSaving ? "Saving..." : isEditMode ? "Update Address" : "Save Address"}
                </button>
            </div>
        </form>
    );
};

// ---------------- ADDRESS CARD WITH RADIO BUTTON ----------------
const AddressCard = ({ address, onEdit, onDelete, onSelect, isSelected }) => {
    // Handle card click for selection
    const handleCardClick = (e) => {
        // Don't trigger selection if clicking on edit/delete buttons
        if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) {
            return;
        }
        onSelect(address);
    };

    // Handle edit button click
    const handleEditClick = (e) => {
        e.stopPropagation(); // Prevent card selection
        onEdit(address);
    };

    // Handle delete button click
    const handleDeleteClick = (e) => {
        e.stopPropagation(); // Prevent card selection
        onDelete(address.id);
    };

    return (
        <div 
            className={`address-card ${isSelected ? "selected" : ""}`}
            onClick={handleCardClick}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(address);
                }
            }}
        >
            <div className="address-radio-wrapper">
                <input
                    type="radio"
                    id={`address-${address.id}`}
                    name="selectedAddress"
                    checked={isSelected}
                    onChange={() => onSelect(address)}
                    className="address-radio-input"
                />
                <span className="radio-custom"></span>
            </div>

            <div className="address-content">
                <div className="address-header-row">
                    <div className="address-info-left">
                        <h4 className="address-name">{address.full_name}</h4>
                        {address.is_default && (
                            <span className="address-tag default-tag">
                                <Home size={14} /> Default
                            </span>
                        )}
                        {isSelected && (
                            <span className="address-tag selected-tag">
                                <CheckCircle size={14} /> Selected
                            </span>
                        )}
                    </div>
                </div>

                <div className="address-details">
                    <p className="address-text">
                        {address.address_line_1}
                        {address.address_line_2 && `, ${address.address_line_2}`}
                    </p>
                    <p className="address-text">
                        {address.city}, {address.state} - {address.country} - {address.postal_code}
                    </p>
                    
                    {(address.latitude && address.longitude) && (
                        <p className="address-geo small-text">
                            Geo: Lat {parseFloat(address.latitude).toFixed(4)}, Long {parseFloat(address.longitude).toFixed(4)}
                        </p>
                    )}

                    <p className="address-phone">Phone: {address.phone_number}</p>
                </div>

                <div className="address-actions">
                    <button onClick={handleEditClick} className="action-btn edit-btn">
                        <Edit size={14} /> Edit
                    </button>
                    <button onClick={handleDeleteClick} className="action-btn delete-btn">
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// ---------------- MAIN COMPONENT ----------------
const AddressManager = () => {
    const {
        addresses,
        selectedAddress,
        setSelectedAddress,
        addAddress,
        updateAddress,
        deleteAddress,
        loadAddresses
    } = useAddress();

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        loadAddresses();
    }, [loadAddresses]);

    const handleSaveAddress = async (formData) => {
        try {
            setIsSaving(true);
            
            const payload = {
                ...formData,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            };

            if (payload.id) {
                await updateAddress(payload.id, payload);
            } else {
                await addAddress(payload);
            }

            setIsFormVisible(false);
            setEditingAddress(null);

        } catch (err) {
            alert("Failed to save address.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditAddress = (address) => {
        const formattedAddress = {
            ...address,
            latitude: address.latitude?.toString() || "",
            longitude: address.longitude?.toString() || "",
        };
        setEditingAddress(formattedAddress);
        setIsFormVisible(true);
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;

        setDeleteId(id);
        try {
            await deleteAddress(id);
        } catch (err) {
            alert("Failed to delete address.");
        } finally {
            setDeleteId(null);
        }
    };

    const handleSelectAddress = (address) => {
        setSelectedAddress(address);
    };

    return (
        <div className="address-manager-wrapper">
            <style>{AddressManagerStyles}</style>

            {isFormVisible && (
                <AddressForm
                    initialData={editingAddress}
                    onSubmit={handleSaveAddress}
                    onCancel={() => {
                        setIsFormVisible(false);
                        setEditingAddress(null);
                    }}
                    isSaving={isSaving}
                />
            )}

            <div className="address-list-header">
                <h3 className="section-title">Saved Addresses ({addresses.length})</h3>
                
                {!isFormVisible && (
                    <button 
                        className="btn-add-address"
                        onClick={() => {
                            setEditingAddress(null);
                            setIsFormVisible(true);
                        }}
                    >
                        <Plus size={16} /> Add New Address
                    </button>
                )}
            </div>

            <div className="address-list">
                {addresses.length === 0 ? (
                    <div className="empty-addresses">
                        <MapPin size={40} />
                        <p>No addresses found. Click 'Add New' to create one.</p>
                    </div>
                ) : (
                    addresses.map(address => (
                        <AddressCard
                            key={address.id}
                            address={address}
                            onEdit={handleEditAddress}
                            onDelete={handleDeleteAddress}
                            onSelect={handleSelectAddress}
                            isSelected={selectedAddress?.id === address.id}
                        />
                    ))
                )}
            </div>

            {addresses.length > 0 && !isFormVisible && (
                <div className="address-manager-note">
                    * Click anywhere on the address card to select it for shipping
                </div>
            )}
        </div>
    );
};

export default AddressManager;

// --- COMPONENT STYLES ---
const AddressManagerStyles = `
    /* Base Styles */
    .address-manager-wrapper {
        padding: 0;
        max-width: 850px;
        margin: 0 auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Header */
    .address-list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 20px 0;
        padding-bottom: 15px;
        border-bottom: 1px solid #E5E5E5;
    }

    .section-title {
        font-size: 18px;
        font-weight: 600;
        color: #000000;
        margin: 0;
    }

    .btn-add-address {
        background: #FFD700;
        color: #000000;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.2s ease;
    }

    .btn-add-address:hover:not(:disabled) {
        background: #F0C800;
    }

    .btn-add-address:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* Address Form */
    .address-form-box {
        background: #FFFFFF;
        border: 1px solid #E5E5E5;
        border-radius: 8px;
        padding: 25px;
        margin-bottom: 30px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .form-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
    }

    .form-header {
        font-size: 20px;
        font-weight: 600;
        color: #000000;
        margin: 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #FFD700;
    }

    .form-cancel-btn {
        background: transparent;
        color: #666666;
        border: 1px solid #E5E5E5;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .form-cancel-btn:hover {
        border-color: #000000;
        color: #000000;
    }

    /* Form Grid */
    .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-bottom: 20px;
    }

    @media (max-width: 768px) {
        .form-grid {
            grid-template-columns: 1fr;
            gap: 15px;
        }
    }

    .form-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .form-field label {
        font-size: 14px;
        font-weight: 500;
        color: #000000;
    }

    .form-field input {
        width: 100%;
        padding: 12px;
        border: 1px solid #E5E5E5;
        border-radius: 6px;
        font-size: 14px;
        color: #000000;
        background: #FFFFFF;
        transition: border-color 0.2s ease;
    }

    .form-field input:focus {
        outline: none;
        border-color: #FFD700;
        box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.1);
    }

    /* Default Checkbox */
    .default-checkbox-wrapper {
        margin: 20px 0;
    }

    .default-checkbox {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: #000000;
        cursor: pointer;
    }

    .default-checkbox input[type="checkbox"] {
        width: 16px;
        height: 16px;
        accent-color: #FFD700;
    }

    /* Form Actions */
    .form-actions {
        margin-top: 25px;
        display: flex;
        justify-content: flex-end;
    }

    .btn-primary-save {
        background: #FFD700;
        color: #000000;
        border: none;
        padding: 14px 32px;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s ease;
        min-width: 150px;
    }

    .btn-primary-save:hover:not(:disabled) {
        background: #F0C800;
    }

    .btn-primary-save:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* Location Button */
    .location-fetch-wrapper {
        margin: 20px 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .btn-location {
        background: #FFD700;
        color: #000000;
        border: none;
        padding: 12px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: background 0.2s ease;
    }

    .btn-location:hover:not(:disabled) {
        background: #F0C800;
    }

    .btn-location:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .location-status {
        font-size: 13px;
        padding: 10px 12px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .location-status.success {
        background: #F0F8E0;
        color: #4A7C00;
        border: 1px solid #D4E6A3;
    }

    .location-status.error {
        background: #FFE5E5;
        color: #CC0000;
        border: 1px solid #FFCCCC;
    }

    .spin {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    /* Address List */
    .address-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-top: 20px;
    }

    /* Address Card - CLICKABLE */
    .address-card {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        padding: 20px;
        border: 1px solid #E5E5E5;
        border-radius: 8px;
        background: #FFFFFF;
        transition: all 0.2s ease;
        cursor: pointer;
        position: relative;
    }

    .address-card:hover {
        border-color: #FFD700;
        background: #FFFDF5;
    }

    .address-card.selected {
        border-color: #FFD700;
        border-width: 2px;
        background: #FFFDF5;
        box-shadow: 0 0 0 1px #FFD700;
    }

    /* Radio Button */
    .address-radio-wrapper {
        position: relative;
        margin-top: 3px;
        flex-shrink: 0;
    }

    .address-radio-input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
    }

    .radio-custom {
        display: block;
        width: 18px;
        height: 18px;
        border: 2px solid #D9D9D9;
        border-radius: 50%;
        background: #FFFFFF;
        position: relative;
        transition: all 0.2s ease;
    }

    .address-card:hover .radio-custom {
        border-color: #FFD700;
    }

    .address-card.selected .radio-custom {
        border-color: #FFD700;
        background: #FFD700;
    }

    .radio-custom::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #000000;
        display: none;
    }

    .address-card.selected .radio-custom::after {
        display: block;
    }

    /* Address Content */
    .address-content {
        flex: 1;
    }

    .address-info-left {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
        flex-wrap: wrap;
    }

    .address-name {
        font-size: 16px;
        font-weight: 600;
        color: #000000;
        margin: 0;
    }

    .address-tag {
        font-size: 12px;
        padding: 3px 8px;
        border-radius: 4px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }

    .default-tag {
        background: #FFF3CD;
        color: #000000;
        border: 1px solid #FFD700;
    }

    .selected-tag {
        background: #FFF3CD;
        color: #000000;
        border: 1px solid #FFD700;
    }

    .address-details {
        margin-bottom: 15px;
    }

    .address-text {
        font-size: 14px;
        color: #666666;
        margin: 4px 0;
        line-height: 1.5;
    }

    .address-geo {
        font-size: 12px;
        color: #888888;
        margin-top: 8px;
    }

    .address-phone {
        font-size: 13px;
        color: #666666;
        margin-top: 8px;
    }

    /* Address Actions */
    .address-actions {
        display: flex;
        gap: 10px;
        padding-top: 15px;
        border-top: 1px solid #F0F0F0;
    }

    .action-btn {
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
        border: 1px solid transparent;
    }

    .edit-btn {
        background: #FFD700;
        color: #000000;
        border-color: #FFD700;
    }

    .edit-btn:hover {
        background: #F0C800;
        border-color: #F0C800;
    }

    .delete-btn {
        background: transparent;
        color: #FF0000;
        border-color: #FFCCCC;
    }

    .delete-btn:hover {
        background: #FFE5E5;
    }

    /* Make sure edit/delete buttons don't trigger card selection */
    .edit-btn, .delete-btn {
        cursor: pointer;
        position: relative;
        z-index: 2;
    }

    /* Empty State */
    .empty-addresses {
        text-align: center;
        padding: 40px 20px;
        color: #666666;
        background: #FAFAFA;
        border-radius: 8px;
        border: 1px dashed #E5E5E5;
    }

    .empty-addresses svg {
        margin-bottom: 15px;
        color: #CCCCCC;
    }

    .empty-addresses p {
        margin-bottom: 15px;
    }

    /* Note */
    .address-manager-note {
        font-size: 13px;
        color: #666666;
        margin-top: 20px;
        text-align: center;
        font-style: italic;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
        .address-list-header {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
        }

        .btn-add-address {
            width: 100%;
            justify-content: center;
        }

        .address-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .address-radio-wrapper {
            margin-top: 0;
        }

        .address-info-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }

        .address-actions {
            flex-direction: column;
            gap: 8px;
            width: 100%;
        }

        .action-btn {
            width: 100%;
            justify-content: center;
        }

        .form-header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
        }

        .form-cancel-btn {
            align-self: flex-start;
        }

        .form-actions {
            justify-content: center;
        }

        .btn-primary-save {
            width: 100%;
        }
    }

    @media (max-width: 480px) {
        .address-form-box {
            padding: 20px;
        }

        .form-field label {
            font-size: 13px;
        }

        .form-field input {
            padding: 10px;
            font-size: 13px;
        }

        .btn-location {
            padding: 10px;
            font-size: 14px;
        }

        .btn-primary-save {
            padding: 12px 24px;
            font-size: 15px;
        }
    }

    /* Focus States */
    .address-card:focus {
        outline: 2px solid #FFD700;
        outline-offset: 2px;
    }

    button:focus,
    input:focus,
    textarea:focus,
    select:focus {
        outline: 2px solid #FFD700;
        outline-offset: 2px;
    }

    /* Disabled States */
    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;