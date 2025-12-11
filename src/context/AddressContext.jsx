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
    const { user } = useUser();
    const currentUserId = user?.id || null;

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);

    // ---------------- LOAD ADDRESSES ----------------
    const loadAddresses = useCallback(async () => {
        if (!currentUserId) return;

        try {
            const data = await addressService.getAll(currentUserId);
            setAddresses(data);

            // 🔥 If user manually selected an address, DO NOT override that selection
            if (selectedAddress && data.some(a => a.id === selectedAddress.id)) {
                return; // keep the user-selected one
            }

            // 🔥 Otherwise, pick default → or first available
            const defaultAddr = data.find(a => a.is_default);
            setSelectedAddress(defaultAddr || data[0] || null);

        } catch (err) {
            console.error("Failed to load addresses:", err?.response?.data || err);
        }
    }, [currentUserId, selectedAddress]);

    useEffect(() => {
        if (currentUserId) loadAddresses();
    }, [currentUserId, loadAddresses]);


    // ---------------- ADD ADDRESS ----------------
    const addAddress = useCallback(async (payload) => {
        try {
            const payloadWithUserId = { ...payload, user_id: currentUserId };
            const newAddress = await addressService.add(payloadWithUserId);

            setAddresses(prev => {
                let updated = [...prev, newAddress];

                // If new is default → remove default from others
                if (newAddress.is_default) {
                    updated = updated.map(a =>
                        a.id !== newAddress.id ? { ...a, is_default: false } : newAddress
                    );
                    setSelectedAddress(newAddress);
                } else if (!selectedAddress) {
                    setSelectedAddress(newAddress);
                }

                return updated;
            });

            return newAddress;
        } catch (err) {
            console.error("Failed to add address:", err);
            throw err;
        }
    }, [currentUserId, selectedAddress]);


    // ---------------- UPDATE ADDRESS ----------------
    const updateAddress = useCallback(async (id, payload) => {
        try {
            const payloadWithUserId = { ...payload, user_id: currentUserId };
            const updated = await addressService.update(id, payloadWithUserId);

            setAddresses(prev => {
                let next = prev.map(a => (a.id === id ? updated : a));

                if (updated.is_default) {
                    next = next.map(a =>
                        a.id !== id ? { ...a, is_default: false } : updated
                    );
                    setSelectedAddress(updated);
                } else if (selectedAddress?.id === id) {
                    setSelectedAddress(updated);
                }

                return next;
            });

            return updated;
        } catch (err) {
            console.error("Failed to update address:", err);
            throw err;
        }
    }, [currentUserId, selectedAddress]);


    // ---------------- DELETE ADDRESS ----------------
const deleteAddress = useCallback(async (id) => {
  try {
    // 1st try: simple delete
    await addressService.remove(id);
  } catch (err) {
    const msg = err?.response?.data?.error?.toLowerCase() || "";

    if (msg.includes("invalid user") || msg.includes("not found")) {
      // 2nd try: delete + user_id query param
      try {
        await addressService.removeWithUser(id, currentUserId);
      } catch (err2) {
        // 3rd try: delete + user_id in body
        await addressService.removeWithBody(id, currentUserId);
      }
    } else {
      throw err;
    }
  }

  // Update state after successful delete
  setAddresses(prev => {
    const updated = prev.filter(a => a.id !== id);

    if (selectedAddress?.id === id) {
      const fallback = updated.find(a => a.is_default) || updated[0] || null;
      setSelectedAddress(fallback);
    }

    return updated;
  });
}, [currentUserId, selectedAddress]);





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
                userId: currentUserId,
            }}
        >
            {children}
        </AddressContext.Provider>
    );
};
