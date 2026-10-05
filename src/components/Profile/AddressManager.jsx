import React, { useState, useEffect, useCallback } from 'react';
import { useAddress } from '../../context/AddressContext';
import { useUser } from '../../context/UserContext';
import { Plus, MapPin, Edit, Trash2, Home, CheckCircle, Loader2, XCircle, ShieldCheck, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ---------------- ADDRESS FORM ----------------
const AddressForm = ({ initialData, onSubmit, onCancel, isSaving }) => {
    const { user } = useUser();
    const [formData, setFormData] = useState(initialData || {
        full_name: user?.name || user?.username || "",
        phone_number: user?.mobile_number || user?.mobile || user?.phone || "",
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
    const [locationSuccess, setLocationSuccess] = useState(null);
    const isEditMode = Boolean(initialData?.id);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleGetLocation = async () => {
        setLocationLoading(true);
        setLocationError(null);
        setLocationSuccess(null);

        // Helper: retrieve coordinates from browser geolocation API
        const getBrowserCoords = () => {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    return reject(new Error("Geolocation is not supported by your browser."));
                }
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                    (err) => {
                        // Retry with low accuracy (WiFi/cell tower) if high accuracy times out or fails
                        navigator.geolocation.getCurrentPosition(
                            (pos2) => resolve({ lat: pos2.coords.latitude, lon: pos2.coords.longitude }),
                            () => reject(err),
                            { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
                        );
                    },
                    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
                );
            });
        };

        let coords = null;
        try {
            coords = await getBrowserCoords();
        } catch (geoErr) {
            console.warn("Browser GPS failed or denied, trying network IP geolocation fallback:", geoErr?.message);
            // Fallback: IP-based geolocation (works on PC / desktop without GPS)
            try {
                const ipRes = await fetch("https://api.bigdatacloud.net/data/reverse-geocode-client");
                if (ipRes.ok) {
                    const ipData = await ipRes.json();
                    if (ipData.latitude && ipData.longitude) {
                        coords = { lat: ipData.latitude, lon: ipData.longitude };
                    }
                }
            } catch (ipErr) {
                console.warn("IP geolocation fallback failed:", ipErr);
            }
        }

        if (!coords || !coords.lat || !coords.lon) {
            setLocationLoading(false);
            setLocationError("Could not retrieve GPS coordinates. Please enter your address details manually.");
            return;
        }

        const latStr = coords.lat.toString();
        const lonStr = coords.lon.toString();

        // Reverse Geocoding to automatically populate address fields
        let reverseData = null;

        // 1. Try Nominatim (OpenStreetMap)
        try {
            const nomRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}&addressdetails=1`,
                { headers: { "Accept-Language": "en" } }
            );
            if (nomRes.ok) {
                const nomData = await nomRes.json();
                const a = nomData.address || {};
                const street = [a.amenity, a.road, a.neighbourhood].filter(Boolean).join(", ") || a.suburb || a.village || "";
                const city = a.city || a.town || a.village || a.county || a.city_district || "";
                const state = a.state || "";
                const postcode = a.postcode || "";
                const country = a.country || "India";

                reverseData = {
                    address_line_1: street || (nomData.display_name ? nomData.display_name.split(",").slice(0, 2).join(",") : ""),
                    address_line_2: a.suburb || a.county || "",
                    city: city,
                    state: state,
                    postal_code: postcode,
                    country: country,
                };
            }
        } catch (e) {
            console.warn("Nominatim reverse geocoding notice:", e);
        }

        // 2. Fallback: BigDataCloud Reverse Geocoding
        if (!reverseData || !reverseData.city) {
            try {
                const bdcRes = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lon}&localityLanguage=en`
                );
                if (bdcRes.ok) {
                    const bdcData = await bdcRes.json();
                    reverseData = {
                        address_line_1: bdcData.locality || bdcData.localityInfo?.administrative?.[3]?.name || "",
                        address_line_2: bdcData.localityInfo?.administrative?.[2]?.name || "",
                        city: bdcData.city || bdcData.locality || "",
                        state: bdcData.principalSubdivision || "",
                        postal_code: bdcData.postcode || "",
                        country: bdcData.countryName || "India",
                    };
                }
            } catch (e2) {
                console.warn("BigDataCloud fallback notice:", e2);
            }
        }

        const resolvedLine1 = reverseData?.address_line_1 || `Near GPS Location (${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)})`;
        const resolvedCity = reverseData?.city || "";
        const resolvedState = reverseData?.state || "";
        const resolvedPostal = reverseData?.postal_code || "";
        const resolvedCountry = reverseData?.country || "India";

        setFormData(prev => ({
            ...prev,
            latitude: latStr,
            longitude: lonStr,
            address_line_1: resolvedLine1,
            address_line_2: reverseData?.address_line_2 || prev.address_line_2 || "",
            city: resolvedCity || prev.city,
            state: resolvedState || prev.state,
            postal_code: resolvedPostal || prev.postal_code,
            country: resolvedCountry,
            full_name: prev.full_name || user?.name || user?.username || "",
            phone_number: prev.phone_number || user?.mobile_number || user?.mobile || user?.phone || "",
        }));

        setLocationLoading(false);
        setLocationSuccess(
            resolvedCity
                ? `📍 Location Synced: ${resolvedCity}, ${resolvedState} ${resolvedPostal ? "(" + resolvedPostal + ")" : ""}`
                : "📍 Precise GPS Coordinates Locked & Address Filled!"
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
                    <h3 className="form-title-luxe">{isEditMode ? "Edit Delivery Address" : "Add New Address"}</h3>
                    <p className="form-subtitle-luxe">Enter your delivery address details below.</p>
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
                    <span>{locationLoading ? "Detecting Address & Coordinates..." : "Sync Precise GPS Coordinates"}</span>
                </button>

                {locationSuccess && !locationLoading && (
                    <div className="geo-status-elite success">
                        <CheckCircle size={15} /> {locationSuccess}
                    </div>
                )}

                {formData.latitude && formData.longitude && !locationSuccess && !locationLoading && (
                    <div className="geo-status-elite success">
                        <CheckCircle size={15} /> Coordinates Locked ({parseFloat(formData.latitude).toFixed(3)}, {parseFloat(formData.longitude).toFixed(3)})
                    </div>
                )}
                
                {locationError && !locationLoading && (
                    <div className="geo-status-elite error">
                        <XCircle size={15} /> {locationError}
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
                <h3 className="section-title">Saved Addresses ({addresses.length})</h3>
                {!isFormVisible && (
                    <button className="btn-add-address" onClick={() => setIsFormVisible(true)}>
                        <Plus size={18} /> Add New Address
                    </button>
                )}
            </div>

            <motion.div layout className="address-list">
                {addresses.length === 0 ? (
                    <div className="empty-addresses-premium">
                        <div className="pulsing-pin"><MapPin size={48} /></div>
                        <h3>No Saved Addresses</h3>
                        <p>Please add a delivery address to continue checkout.</p>
                        <button className="btn-add-address" onClick={() => setIsFormVisible(true)}>Add Delivery Address</button>
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
        padding: 10px 22px;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
    }

    .btn-add-address:hover {
        background: #1e293b;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.2);
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

    .geo-status-elite {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.88rem;
        font-weight: 700;
        padding: 10px 18px;
        border-radius: 1rem;
        animation: fadeIn 0.3s ease-in-out;
    }
    .geo-status-elite.success {
        background: #ecfdf5;
        color: #059669;
        border: 1px solid #a7f3d0;
    }
    .geo-status-elite.error {
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

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
        padding: 2.25rem 1.5rem;
        text-align: center;
        background: #f8fafc;
        border-radius: 1.25rem;
        border: 2px dashed #cbd5e1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.65rem;
    }

    .empty-addresses-premium h3 {
        font-size: 1.15rem;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
    }

    .empty-addresses-premium p {
        font-size: 0.88rem;
        color: #64748b;
        margin: 0 0 0.5rem;
    }

    .pulsing-pin {
        color: #4f46e5;
        margin-bottom: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .spin { animation: spin 2s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

export default AddressManager;