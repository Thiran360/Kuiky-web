import React, { useState, useEffect, useCallback } from 'react';
import { useAddress } from '../../context/AddressContext';
import { Plus, MapPin, Edit, Trash2, Home, CheckCircle } from 'lucide-react';


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
    });

    const isEditMode = Boolean(initialData?.id);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
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
            <h3 className="form-header">{isEditMode ? "Edit Address" : "Add New Address"}</h3>

            <div className="form-grid">
                <input name="full_name" value={formData.full_name} onChange={handleChange}
                    placeholder="Full Name *" required />

                <input name="phone_number" value={formData.phone_number} onChange={handleChange}
                    placeholder="Phone Number" />

                <input name="address_line_1" value={formData.address_line_1} onChange={handleChange}
                    placeholder="Address Line 1 *" required />

                <input name="address_line_2" value={formData.address_line_2} onChange={handleChange}
                    placeholder="Address Line 2" />

                <input name="city" value={formData.city} onChange={handleChange}
                    placeholder="City *" required />

                <input name="state" value={formData.state} onChange={handleChange}
                    placeholder="State *" required />

                <input name="postal_code" value={formData.postal_code} onChange={handleChange}
                    placeholder="Postal Code *" required />

                <input name="country" value={formData.country} onChange={handleChange}
                    placeholder="Country *" required />
            </div>

            <label className="default-checkbox">
                <input type="checkbox" name="is_default"
                    checked={formData.is_default} onChange={handleChange} />
                Set as default shipping address
            </label>

            <div className="form-actions">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary-save" disabled={isSaving}>
                    {isSaving ? "Saving..." : isEditMode ? "Update Address" : "Save Address"}
                </button>
            </div>
        </form>
    );
};


// ---------------- ADDRESS CARD ----------------
const AddressCard = ({ address, onEdit, onDelete, onSelect, isSelected }) => (
    <div className={`address-card ${isSelected ? "selected" : ""}`}>
        <div className="address-header-row">
            <h4 className="address-name">{address.full_name}</h4>

            {address.is_default && (
                <span className="default-tag"><Home size={14} /> Default</span>
            )}

            {isSelected && (
                <span className="selected-tag"><CheckCircle size={14} /> Selected</span>
            )}
        </div>

        <p className="address-lines">
            {address.address_line_1},
            {address.address_line_2 && `${address.address_line_2}, `}
            {address.city}, {address.state} - {address.country} - {address.postal_code}
        </p>

        <p className="address-phone">Phone: {address.phone_number}</p>

        <div className="card-actions">
            <button onClick={() => onEdit(address)} className="action-btn edit-btn">
                <Edit size={14} /> Edit
            </button>

            <button onClick={() => onDelete(address.id)} className="action-btn delete-btn">
                <Trash2 size={14} /> Delete
            </button>

            {!isSelected && (
                <button onClick={() => onSelect(address)} className="action-btn select-btn">
                    Select
                </button>
            )}
        </div>
    </div>
);


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


    // Load addresses once
    useEffect(() => {
        loadAddresses();
    }, [loadAddresses]);


    // ------------ SAVE ADDRESS ------------
    const handleSaveAddress = async (formData) => {
        try {
            setIsSaving(true);

            if (formData.id) {
                await updateAddress(formData.id, formData);
            } else {
                await addAddress(formData);
            }

            setIsFormVisible(false);
            setEditingAddress(null);

        } catch (err) {
            alert("Failed to save address.");
        } finally {
            setIsSaving(false);
        }
    };


    // ------------ EDIT ADDRESS ------------
    const handleEditAddress = (address) => {
        setEditingAddress(address);
        setIsFormVisible(true);
    };


    // ------------ DELETE ADDRESS ------------
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


    // ------------ SELECT ADDRESS ------------
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
                    onCancel={() => setIsFormVisible(false)}
                    isSaving={isSaving}
                />
            )}

            <div className="address-list-header">
                <h3>{addresses.length} Saved Addresses</h3>

                <button className="btn-add-address"
                    disabled={isFormVisible}
                    onClick={() => {
                        setEditingAddress(null);
                        setIsFormVisible(true);
                    }}>
                    <Plus size={16} /> Add New
                </button>
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
                    * The selected address will be used for shipping.
                </div>
            )}
        </div>
    );
};

export default AddressManager;

// --- Component Styles (Updated to reflect form grid change) ---
const AddressManagerStyles = `
    .address-manager-wrapper {
        padding: 0;
        max-width: 850px;
        margin: 0 auto;
    }
    .address-list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 20px 0;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
    }
    .address-list-header h3 {
        font-size: 18px;
        font-weight: 700;
        color: #333;
    }
    .btn-add-address {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        font-weight: 600;
        transition: background-color 0.2s;
    }
    .btn-add-address:hover:not(:disabled) {
        background-color: #0056b3;
    }
    .btn-add-address:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    /* Address Form */
    .address-form-box {
        background: #f8f9fa;
        padding: 25px;
        border-radius: 8px;
        margin-bottom: 30px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    .form-header {
        margin-top: 0;
        margin-bottom: 20px;
        font-size: 1.5rem;
        color: #007bff;
        border-bottom: 2px solid #007bff;
        padding-bottom: 5px;
    }
    .form-grid {
        /* Set to 2 columns */
        display: grid;
        grid-template-columns: 1fr 1fr; 
        gap: 15px;
        margin-bottom: 20px;
    }
    .address-form-box input {
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
    }
    .default-checkbox {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
        font-size: 14px;
        color: #555;
    }
    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
    .btn-primary-save {
        background-color: #ffc107;
        color: #333;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        font-weight: 700;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    .btn-primary-save:hover:not(:disabled) {
        background-color: #e0a800;
    }
    .btn-secondary {
        background: #e9ecef;
        color: #6c757d;
        border: 1px solid #ced4da;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
    }
    .btn-secondary:hover:not(:disabled) {
        background: #d3d9df;
    }

    /* Address Card List */
    .address-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    .address-card {
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #ddd;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
        transition: border-color 0.2s;
    }
    .address-card.selected {
        border-color: #007bff;
        border-width: 2px;
        box-shadow: 0 0 10px rgba(0, 123, 255, 0.1);
    }
    .address-header-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 5px;
    }
    .address-name {
        font-size: 16px;
        font-weight: 700;
        color: #333;
        margin: 0;
    }
    .default-tag, .selected-tag {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .default-tag {
        background-color: #e0f7e9;
        color: #28a745;
        border: 1px solid #28a745;
    }
    .selected-tag {
        background-color: #e6f7ff;
        color: #007bff;
        border: 1px solid #007bff;
    }
    .address-lines {
        font-size: 14px;
        color: #555;
        margin: 5px 0;
    }
    .address-phone {
        font-size: 13px;
        color: #777;
        margin-top: 5px;
        margin-bottom: 10px;
    }
    
    .card-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
        border-top: 1px solid #eee;
        padding-top: 10px;
    }
    .action-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        padding: 5px 10px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 5px;
        transition: background-color 0.2s;
    }
    .edit-btn { color: #ffc107; }
    .edit-btn:hover { background-color: #fff3cd; }
    .delete-btn { color: #dc3545; }
    .delete-btn:hover { background-color: #f8d7da; }
    .select-btn { 
        color: #007bff; 
        border: 1px solid #007bff;
        background-color: #e6f7ff;
    }
    .select-btn:hover { 
        background-color: #007bff; 
        color: white; 
    }

    /* Empty State */
    .empty-addresses {
        text-align: center;
        padding: 40px;
        color: #6c757d;
        background: #f8f9fa;
        border-radius: 8px;
        margin-top: 20px;
        border: 1px dashed #ced4da;
    }
    .empty-addresses svg {
        margin-bottom: 10px;
    }

    .address-manager-note {
        font-size: 12px;
        color: #777;
        margin-top: 10px;
        text-align: center;
    }
`;