// src/context/AddressContext.jsx
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback
} from "react";
import { addressService } from "../api/addressService";
import { useUser } from "./UserContext";

const AddressContext = createContext();
export const useAddress = () => useContext(AddressContext);

export const AddressProvider = ({ children }) => {
    const { user, isAuthenticated } = useUser();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

    // ── LOAD ADDRESSES ─────────────────────────────────────
    // The backend resolves the user from the JWT token.
    // We use the token-based endpoint as the primary strategy.
    const loadAddresses = useCallback(async () => {
        if (!isAuthenticated) return;

        setIsLoadingAddresses(true);
        try {
            const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
            const isCustomOtp = token && (token.startsWith("otp_") || token.startsWith("token_"));

            // If the user has a custom OTP/dev token, load from local storage directly
            if (isCustomOtp) {
                const saved = localStorage.getItem("ecom_local_addresses");
                const parsed = saved ? JSON.parse(saved) : [];
                setAddresses(parsed);
                setSelectedAddress(parsed.find(a => a.is_default) || parsed[0] || null);
                return;
            }

            const userIdString = localStorage.getItem("user_id");
            const uid = userIdString ? parseInt(userIdString, 10) : (user?.id ? parseInt(user.id, 10) : null);
            
            let data = [];
            if (uid && !isNaN(uid)) {
                try {
                    data = await addressService.getAll(uid);
                } catch (err) {
                    if (err?.response?.status === 401) throw err;
                    data = await addressService.getAllTokenBased();
                }
            } else {
                data = await addressService.getAllTokenBased();
            }

            if (!Array.isArray(data)) data = [];
            setAddresses(data);
            try {
                localStorage.setItem("ecom_local_addresses", JSON.stringify(data));
            } catch (e) {}

            setSelectedAddress(prev => {
                if (prev && data.some(a => a.id === prev.id)) return prev;
                return data.find(a => a.is_default) || data[0] || null;
            });

        } catch (err) {
            // Fallback to locally cached addresses if backend 401/404/network error
            try {
                const saved = localStorage.getItem("ecom_local_addresses");
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setAddresses(parsed);
                    setSelectedAddress(parsed.find(a => a.is_default) || parsed[0] || null);
                    return;
                }
            } catch (e) {}

            setAddresses([]);
            setSelectedAddress(null);
        } finally {
            setIsLoadingAddresses(false);
        }
    }, [isAuthenticated, user?.id]);

    useEffect(() => {
        if (isAuthenticated) {
            loadAddresses();
        } else {
            setAddresses([]);
            setSelectedAddress(null);
        }
    }, [isAuthenticated, loadAddresses]);

    // ── ADD ADDRESS ────────────────────────────────────────
    // The backend resolves user from JWT — do NOT send user_id.
    const addAddress = useCallback(async (payload) => {
        if (!isAuthenticated) throw new Error("You must be logged in to add an address.");

        // Ensure user_id is present in the payload (some backends require it in body)
        const userIdString = localStorage.getItem("user_id");
        const uid = userIdString ? parseInt(userIdString, 10) : (user?.id ? parseInt(user.id, 10) : null);
        
        const cleanPayload = {
            ...payload,
            user_id: uid
        };
        // Remove nested user/id objects to avoid confusion
        delete cleanPayload.user;
        delete cleanPayload.id;

        try {
            const newAddress = await addressService.add(cleanPayload);
            const savedAddress = newAddress?.id ? newAddress : { ...cleanPayload, id: 'addr_' + Date.now() };

            setAddresses(prev => {
                let updated = [...prev, savedAddress];
                if (savedAddress.is_default) {
                    updated = updated.map(a =>
                        a.id !== savedAddress.id ? { ...a, is_default: false } : savedAddress
                    );
                    setSelectedAddress(savedAddress);
                } else {
                    setSelectedAddress(s => s || savedAddress);
                }
                try { localStorage.setItem("ecom_local_addresses", JSON.stringify(updated)); } catch (e) {}
                return updated;
            });

            return savedAddress;
        } catch (err) {
            // Local fallback for dev/offline sessions
            console.warn("Backend address creation failed, storing locally:", err?.response?.data || err);
            const localAddress = {
                ...cleanPayload,
                id: 'local_addr_' + Date.now(),
                is_default: cleanPayload.is_default ?? true
            };
            setAddresses(prev => {
                const updated = [...prev, localAddress];
                setSelectedAddress(s => s || localAddress);
                try { localStorage.setItem("ecom_local_addresses", JSON.stringify(updated)); } catch (e) {}
                return updated;
            });
            return localAddress;
        }
    }, [isAuthenticated]);

    // ── UPDATE ADDRESS ─────────────────────────────────────
    const updateAddress = useCallback(async (id, payload) => {
        if (!isAuthenticated) throw new Error("You must be logged in.");

        const userIdString = localStorage.getItem("user_id");
        const uid = userIdString ? parseInt(userIdString, 10) : (user?.id ? parseInt(user.id, 10) : null);

        const cleanPayload = {
            ...payload,
            user_id: uid
        };
        delete cleanPayload.user;

        try {
            const updated = await addressService.update(id, cleanPayload);

            setAddresses(prev => {
                let next = prev.map(a => (a.id === id ? updated : a));
                if (updated.is_default) {
                    next = next.map(a => a.id !== id ? { ...a, is_default: false } : updated);
                    setSelectedAddress(updated);
                } else {
                    setSelectedAddress(s => s?.id === id ? updated : s);
                }
                return next;
            });

            return updated;
        } catch (err) {
            console.error("Failed to update address:", err?.response?.data || err);
            throw err;
        }
    }, [isAuthenticated]);

    // ── DELETE ADDRESS ─────────────────────────────────────
    const deleteAddress = useCallback(async (id) => {
        try {
            await addressService.remove(id);
        } catch (err) {
            console.error("Failed to delete address:", err?.response?.data || err);
            throw err;
        }

        setAddresses(prev => {
            const updated = prev.filter(a => a.id !== id);
            setSelectedAddress(s => {
                if (s?.id !== id) return s;
                return updated.find(a => a.is_default) || updated[0] || null;
            });
            return updated;
        });
    }, []);

    return (
        <AddressContext.Provider
            value={{
                addresses,
                selectedAddress,
                setSelectedAddress,
                addAddress,
                updateAddress,
                deleteAddress,
                loadAddresses,
                isLoadingAddresses,
            }}
        >
            {children}
        </AddressContext.Provider>
    );
};
