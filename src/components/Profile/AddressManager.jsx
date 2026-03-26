import React, { useState, useEffect, useCallback } from 'react';
import { useAddress } from '../../context/AddressContext';
import { Plus, MapPin, Edit, Trash2, Home, CheckCircle, Loader2, XCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        is_default: true,
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
                let msg = "Failed to synchronize location.";
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
        onSubmit(formData);
    };

    return (
        <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleSubmit} 
            className="address-premium-form"
        >
            <div className="form-head-elite">
                <div className="head-text-col">
                    <h3 className="form-title-luxe">{isEditMode ? "Update Delivery Protocol" : "Add New Destination"}</h3>
                    <p className="form-subtitle-luxe">Ensure your luxury items arrive at the precise coordinates.</p>
                </div>
                <button type="button" onClick={onCancel} className="close-form-luxe">
                    <XCircle size={24} />
                </button>
            </div>

            <div className="form-quad-grid">
                <div className="luxe-input-group">
                    <label>Recipient Name</label>
                    <input
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="e.g. Alexander Pierce"
                        required
                    />
                </div>

                <div className="luxe-input-group">
                    <label>Contact Phone</label>
                    <input
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        placeholder="+91 00000 00000"
                    />
                </div>

                <div className="luxe-input-group full">
                    <label>Primary Address Line</label>
                    <input
                        name="address_line_1"
                        value={formData.address_line_1}
                        onChange={handleChange}
                        placeholder="Street, Suite, or Landmark"
                        required
                    />
                </div>

                <div className="luxe-input-group full">
                    <label>Secondary Address (Optional)</label>
                    <input
                        name="address_line_2"
                        value={formData.address_line_2}
                        onChange={handleChange}
                        placeholder="Apartment, Floor, etc."
                    />
                </div>

                <div className="luxe-input-group">
                    <label>City / Hub</label>
                    <input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter City"
                        required
                    />
                </div>

                <div className="luxe-input-group">
                    <label>State / Region</label>
                    <input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter State"
                        required
                    />
                </div>

                <div className="luxe-input-group">
                    <label>Postal Code</label>
                    <input
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleChange}
                        placeholder="6-digit ZIP"
                        required
                    />
                </div>

                <div className="luxe-input-group">
                    <label>Country</label>
                    <input
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Country"
                        required
                    />
                </div>
            </div>

            <div className="geo-sync-section">
                <button
                    type="button"
                    className="btn-sync-geo"
                    onClick={handleGetLocation}
                    disabled={locationLoading || isSaving}
                >
                    {locationLoading ? (
                        <Loader2 size={18} className="spin" />
                    ) : (
                        <MapPin size={18} />
                    )}
                    <span>Sync Precise GPS Coordinates</span>
                </button>

                {formData.latitude && formData.longitude && !locationLoading && (
                    <div className="geo-status-elite success">
                        <CheckCircle size={14} /> Coordinates Locked
                    </div>
                )}
                
                {locationError && (
                    <div className="geo-status-elite error">
                        <XCircle size={14} /> {locationError}
                    </div>
                )}
            </div>

            <div className="form-footer-elite">
                <label className="luxe-checkbox">
                    <input
                        type="checkbox"
                        name="is_default"
                        checked={formData.is_default}
                        onChange={handleChange}
                    />
                    <div className="check-box-luxe">
                         <CheckCircle size={16} className="checked-icon" />
                    </div>
                    Establish as Default Destination
                </label>

                <button type="submit" className="btn-luxe-submit" disabled={isSaving}>
                    {isSaving ? (
                        <><Loader2 size={20} className="spin mr-2" /> PROCESSING...</>
                    ) : (
                        isEditMode ? "CONFIRM ALLOCATION" : "DEPLOY ADDRESS"
                    )}
                </button>
            </div>
        </motion.form>
    );
};

// ---------------- ADDRESS CARD ----------------
const AddressCard = ({ address, onEdit, onDelete, onSelect, isSelected }) => {
    const handleCardClick = (e) => {
        if (e.target.closest('.luxe-action-btn')) return;
        onSelect(address);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`destination-card-luxe ${isSelected ? "active" : ""}`}
            onClick={handleCardClick}
        >
            <div className="destination-visual">
                <div className="selector-ring-luxe">
                    <div className="inner-dot"></div>
                </div>
                <div className="icon-shield">
                    <ShieldCheck size={24} />
                </div>
            </div>

            <div className="destination-details">
                <div className="dest-header-row">
                    <h4 className="dest-user-name">{address.full_name || address.name}</h4>
                    <div className="dest-tags-row">
                        {address.is_default && <span className="luxe-badge gold">DEFAULT</span>}
                        {isSelected && <span className="luxe-badge blue">SELECTED</span>}
                    </div>
                </div>

                <div className="dest-body-luxe">
                    <p className="dest-main-line">
                        {address.address || address.address_line_1}
                        {address.address_line_2 && `, ${address.address_line_2}`}
                    </p>
                    <p className="dest-sub-line">
                        {address.city}, {address.state} - {address.country}
                    </p>
                    <div className="dest-footer-row">
                        <span className="dest-pincode">PIN {address.pincode || address.postal_code}</span>
                        <span className="dest-phone">PH {address.phone_number || address.mobile}</span>
                    </div>
                </div>

                <div className="dest-actions-overlay">
                    <button onClick={() => onEdit(address)} className="luxe-action-btn edit">
                        <Edit size={14} /> <span>MODIFY</span>
                    </button>
                    <button onClick={() => onDelete(address.id)} className="luxe-action-btn delete">
                        <Trash2 size={14} /> <span>PURGE</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

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

    useEffect(() => { loadAddresses(); }, []);

    const handleSaveAddress = async (formData) => {
        try {
            setIsSaving(true);
            const payload = { ...formData, pincode: String(formData.postal_code) };
            if (payload.id) await updateAddress(payload.id, payload);
            else await addAddress(payload);
            setIsFormVisible(false);
            setEditingAddress(null);
        } catch (err) {
            alert("Administrative Error: " + (err?.response?.data?.message || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="address-manager-wrapper">
            <style>{AddressManagerStyles}</style>

            <AnimatePresence>
                {isFormVisible && (
                    <AddressForm
                        initialData={editingAddress}
                        onSubmit={handleSaveAddress}
                        onCancel={() => { setIsFormVisible(false); setEditingAddress(null); }}
                        isSaving={isSaving}
                    />
                )}
            </AnimatePresence>

            <div className="address-list-header">
                <h3 className="section-title">Verified Destinations ({addresses.length})</h3>
                {!isFormVisible && (
                    <button className="btn-add-address" onClick={() => setIsFormVisible(true)}>
                        <Plus size={18} /> New Coordinate
                    </button>
                )}
            </div>

            <motion.div layout className="address-list">
                {addresses.length === 0 ? (
                    <div className="empty-addresses-premium">
                        <div className="pulsing-pin"><MapPin size={48} /></div>
                        <h3>No Destination Protocol Established</h3>
                        <p>Begin your procurement journey by defining a delivery point.</p>
                        <button className="btn-add-address" onClick={() => setIsFormVisible(true)}>Establish First Protocol</button>
                    </div>
                ) : (
                    addresses.map(address => (
                        <AddressCard
                            key={address.id}
                            address={address}
                            onEdit={(addr) => { setEditingAddress(addr); setIsFormVisible(true); }}
                            onDelete={(id) => window.confirm("Terminate this destination protocol?") && deleteAddress(id)}
                            onSelect={setSelectedAddress}
                            isSelected={selectedAddress?.id === address.id}
                        />
                    ))
                )}
            </motion.div>
        </div>
    );
};

const AddressManagerStyles = `
    .address-manager-wrapper {
        padding: 2.5rem;
        max-width: 1200px;
        margin: 0 auto;
        font-family: 'Outfit', sans-serif;
    }

    .address-list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 3.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 2px solid #f1f5f9;
    }

    .section-title {
        font-size: 2rem;
        font-weight: 900;
        color: #0f172a;
        letter-spacing: -1.5px;
    }

    .btn-add-address {
        background: #0f172a;
        color: #ffffff;
        border: none;
        padding: 14px 30px;
        border-radius: 100px;
        font-weight: 850;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 15px 35px rgba(15, 23, 42, 0.2);
    }

    .btn-add-address:hover {
        background: #4f46e5;
        transform: translateY(-5px);
        box-shadow: 0 20px 45px rgba(79, 70, 229, 0.3);
    }

    .address-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 2.5rem;
    }

    /* PREMIUM DESTINATION CARD */
    .destination-card-luxe {
        background: #ffffff;
        border-radius: 3rem;
        padding: 3rem;
        display: flex;
        gap: 2.5rem;
        cursor: pointer;
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(0,0,0,0.03);
        box-shadow: 0 10px 40px rgba(0,0,0,0.02);
    }

    .destination-card-luxe:hover {
        transform: translateY(-10px);
        box-shadow: 0 40px 80px rgba(0,0,0,0.06);
        border-color: rgba(79, 70, 229, 0.2);
    }

    .destination-card-luxe.active {
        background: #f8fafc;
        border: 2px solid #4f46e5;
        box-shadow: 0 40px 90px rgba(79, 70, 229, 0.1);
    }

    .destination-visual {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
    }

    .selector-ring-luxe {
        width: 30px;
        height: 30px;
        border: 3px solid #e2e8f0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: 0.4s;
    }

    .active .selector-ring-luxe {
        border-color: #4f46e5;
        background: #4f46e5;
    }

    .inner-dot {
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        transform: scale(0);
        transition: 0.4s;
    }

    .active .inner-dot { transform: scale(1); }

    .icon-shield {
        width: 64px;
        height: 64px;
        background: #f1f5f9;
        border-radius: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
        transition: 0.4s;
    }

    .active .icon-shield {
        background: #4f46e5;
        color: white;
        box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
    }

    .destination-details { flex: 1; }

    .dest-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .dest-user-name {
        font-size: 1.4rem;
        font-weight: 900;
        color: #0f172a;
        letter-spacing: -0.5px;
    }

    .luxe-badge {
        font-size: 0.6rem;
        font-weight: 900;
        padding: 5px 12px;
        border-radius: 100px;
        letter-spacing: 1.5px;
    }
    .luxe-badge.gold { background: #fef3c7; color: #92400e; }
    .luxe-badge.blue { background: #e0f2fe; color: #0369a1; }

    .dest-main-line {
        font-size: 1.1rem;
        font-weight: 600;
        color: #334155;
        line-height: 1.6;
        margin-bottom: 0.5rem;
    }

    .dest-sub-line {
        font-size: 0.95rem;
        color: #64748b;
        margin-bottom: 2rem;
    }

    .dest-footer-row {
        display: flex;
        gap: 25px;
        font-size: 0.85rem;
        font-weight: 850;
        color: #1e293b;
    }

    .dest-actions-overlay {
        margin-top: 2.5rem;
        padding-top: 2rem;
        border-top: 1px dashed #e2e8f0;
        display: flex;
        gap: 15px;
    }

    .luxe-action-btn {
        padding: 10px 20px;
        border-radius: 1rem;
        border: 1px solid transparent;
        background: #f8fafc;
        font-size: 0.75rem;
        font-weight: 900;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: 0.3s;
    }

    .luxe-action-btn.edit:hover { background: #fff; border-color: #0f172a; }
    .luxe-action-btn.delete:hover { background: #fef2f2; border-color: #ef4444; color: #ef4444; }

    /* PREMIUM FORM BOX */
    .address-premium-form {
        background: #ffffff;
        border-radius: 4rem;
        padding: 4rem;
        margin-bottom: 5rem;
        box-shadow: 0 50px 120px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(0,0,0,0.02);
    }

    .form-head-elite {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4rem;
    }

    .form-title-luxe {
        font-size: 2.25rem;
        font-weight: 950;
        color: #0f172a;
        letter-spacing: -2px;
        margin-bottom: 0.5rem;
    }

    .form-subtitle-luxe { color: #64748b; font-size: 1rem; }

    .close-form-luxe {
        background: transparent;
        border: none;
        color: #cbd5e1;
        cursor: pointer;
        transition: 0.4s ease;
    }
    .close-form-luxe:hover { color: #ef4444; transform: rotate(90deg) scale(1.2); }

    .form-quad-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
        margin-bottom: 3rem;
    }

    .luxe-input-group { display: flex; flex-direction: column; gap: 10px; }
    .luxe-input-group.full { grid-column: 1 / -1; }

    .luxe-input-group label {
        font-size: 0.75rem;
        font-weight: 900;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-left: 5px;
    }

    .luxe-input-group input {
        padding: 1.3rem;
        background: #f8fafc;
        border: 2px solid transparent;
        border-radius: 1.5rem;
        font-size: 1rem;
        font-weight: 600;
        transition: all 0.4s;
    }

    .luxe-input-group input:focus {
        background: #ffffff;
        border-color: #4f46e5;
        box-shadow: 0 0 25px rgba(79, 70, 229, 0.1);
        outline: none;
    }

    .geo-sync-section {
        display: flex;
        align-items: center;
        gap: 25px;
        margin-bottom: 4rem;
        padding: 2rem;
        background: #eef2ff;
        border-radius: 2.5rem;
        border: 1px dashed #c7d2fe;
    }

    .btn-sync-geo {
        background: #0f172a;
        color: white;
        border: none;
        padding: 15px 25px;
        border-radius: 1.25rem;
        font-weight: 900;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: 0.3s;
    }
    .btn-sync-geo:hover:not(:disabled) { background: #4f46e5; transform: scale(1.05); }

    .form-footer-elite {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 3rem;
        border-top: 2px solid #f1f5f9;
    }

    .luxe-checkbox {
        display: flex;
        align-items: center;
        gap: 15px;
        font-size: 1rem;
        font-weight: 800;
        color: #334155;
        cursor: pointer;
    }

    .check-box-luxe {
        width: 30px;
        height: 30px;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: 0.3s;
    }

    .check-box-luxe {
        width: 24px;
        height: 24px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: 0.3s;
    }

    .luxe-checkbox input:checked + .check-box-luxe {
        background: var(--elite-blue, #2563eb);
        border-color: var(--elite-blue, #2563eb);
    }

    .btn-luxe-submit {
        background: var(--elite-slate, #0f172a);
        color: white;
        border: none;
        padding: 1.5rem 4rem;
        border-radius: 2rem;
        font-size: 1.1rem;
        font-weight: 950;
        cursor: pointer;
        transition: 0.5s;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
    }
    .btn-luxe-submit:hover:not(:disabled) { background: var(--elite-blue, #2563eb); transform: translateY(-5px); }

    .empty-addresses-premium {
        grid-column: 1 / -1;
        padding: 6rem;
        text-align: center;
        background: #f8fafc;
        border-radius: 4rem;
        border: 2px dashed #e2e8f0;
    }

    .pulsing-pin {
        color: var(--elite-blue, #2563eb);
        margin-bottom: 2rem;
        animation: pinFloat 3s infinite ease-in-out;
    }

    @keyframes pinFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-15px); }
    }

    .spin { animation: spin 2s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

export default AddressManager;