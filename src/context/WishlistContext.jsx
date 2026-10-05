// src/context/WishlistContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { wishlistService } from "../api/wishlistService";
import { useUser } from "./UserContext";

const WishlistContext = createContext(null);

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated, isLoading: isUserLoading } = useUser();

  // Initialize from local storage for persistence and immediate access
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("localWishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync to local storage whenever wishlist changes
  useEffect(() => {
    try {
      localStorage.setItem("localWishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.warn("Could not save to localWishlist:", e);
    }
  }, [wishlist]);

  // Normalize product ID from any possible shape
  const extractProductId = useCallback((item) => {
    if (!item) return null;
    try {
      const p = item.product || {};
      const potentialIds = [
        item.product_id, // Explicit foreign key
        item.id,         // Direct ID
        p.id,            // ID inside the nested product object
        p.product_id,    // Fallback product key
      ];

      for (let id of potentialIds) {
        if (id != null && id !== undefined && id !== "" && id !== "null") {
          const num = Number(id);
          if (!isNaN(num) && num > 0) return num;
        }
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // Check if a given productId is already in wishlist
  const isProductWishlisted = useCallback(
    (targetId) => {
      if (!targetId) return false;
      const tId = Number(targetId);
      if (isNaN(tId)) return false;

      return wishlist.some((item) => {
        const currentId = extractProductId(item);
        return currentId === tId;
      });
    },
    [wishlist, extractProductId]
  );

  // Load wishlist from server and merge with local items
  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    setLoading(true);
    try {
      const data = await wishlistService.fetchWishlist(user.id);
      if (Array.isArray(data) && data.length > 0) {
        setWishlist((prev) => {
          const serverIds = new Set(data.map((d) => extractProductId(d)));
          const uniqueLocals = prev.filter((p) => !serverIds.has(extractProductId(p)));
          return [...data, ...uniqueLocals];
        });
      }
    } catch (error) {
      console.warn("Failed to load wishlist from server. Using local storage copy.", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, extractProductId]);

  useEffect(() => {
    if (!isUserLoading && isAuthenticated) {
      loadWishlist();
    }
  }, [isUserLoading, isAuthenticated, loadWishlist]);

  // Single source of truth for add/remove (Reliable & Fail-Safe)
  const toggleWishlist = useCallback(
    async (productId, productDetails = null) => {
      if (!productId) return;
      const pIdNum = Number(productId);
      const already = isProductWishlisted(pIdNum);

      let updatedWishlist;
      if (already) {
        updatedWishlist = wishlist.filter(
          (item) => Number(extractProductId(item)) !== pIdNum
        );
      } else {
        const newItem = productDetails
          ? {
              id: pIdNum,
              product_id: pIdNum,
              product: productDetails,
              ...productDetails,
            }
          : {
              id: pIdNum,
              product_id: pIdNum,
            };
        updatedWishlist = [...wishlist, newItem];
      }

      // 1. Instantly update local state & localStorage
      setWishlist(updatedWishlist);
      try {
        localStorage.setItem("localWishlist", JSON.stringify(updatedWishlist));
      } catch (e) {}

      // 2. Best-effort server sync (never revert if server rejects or fails)
      if (isAuthenticated && user?.id) {
        try {
          if (already) {
            await wishlistService.removeFromWishlist(pIdNum);
          } else {
            await wishlistService.addToWishlist({
              user_id: user.id,
              product_id: pIdNum,
            });
          }
        } catch (serverErr) {
          console.warn("Wishlist server sync skipped, persisted locally:", serverErr?.message || serverErr);
        }
      }
    },
    [isAuthenticated, user, wishlist, isProductWishlisted, extractProductId]
  );

  // Local-only remove used by Wishlist page
  const removeItemLocally = useCallback(
    (productId) => {
      setWishlist((prevList) =>
        prevList.filter((item) => {
          const currentId = extractProductId(item);
          return Number(currentId) !== Number(productId);
        })
      );
    },
    [extractProductId]
  );

  const contextValue = useMemo(
    () => ({
      wishlist: Array.isArray(wishlist) ? wishlist : [],
      wishlistCount: Array.isArray(wishlist) ? wishlist.length : 0,
      loading,
      loadWishlist,
      toggleWishlist,
      isProductWishlisted,
      removeItemLocally,
    }),
    [
      wishlist,
      loading,
      loadWishlist,
      toggleWishlist,
      isProductWishlisted,
      removeItemLocally,
    ]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};
