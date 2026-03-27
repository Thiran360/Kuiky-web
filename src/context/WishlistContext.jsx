// src/context/WishlistContext.jsx

import React,
{
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

  // Initialize from local storage for persistence and fallback
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
    localStorage.setItem("localWishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Normalize product ID from any possible shape
  const extractProductId = (item) => {
    if (!item) return null;
    try {
      const product = item.product || item;
      return (
        product?.id ??
        product?.product_id ??
        item.id ??
        item.product_id ??
        item.product?.id ??
        item.product?.product_id ??
        null
      );
    } catch {
      return null;
    }
  };

  // Check if a given productId is already in wishlist
  const isProductWishlisted = useCallback(
    (productId) => {
      if (!productId) return false;
      return wishlist.some((item) => {
        const currentId = extractProductId(item);
        return Number(currentId) === Number(productId);
      });
    },
    [wishlist]
  );

  // Load wishlist from server
  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      // Don't clear local wishlist on logout, but maybe we should?
      // For now, keep it local.
      return;
    }

    setLoading(true);
    try {
      const data = await wishlistService.fetchWishlist(user.id);
      if (Array.isArray(data)) {
        setWishlist(data);
      }
    } catch (error) {
      console.warn("Failed to load wishlist from server. Using local instead.", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isUserLoading && isAuthenticated) {
      loadWishlist();
    } else if (!isUserLoading && !isAuthenticated) {
      // 💎 GUEST MODE: Preserve local wishlist items across sessions
      // if (wishlist.length > 0) { ... }
    }
  }, [isUserLoading, isAuthenticated, loadWishlist]);

  // Single source of truth for add/remove
  const toggleWishlist = useCallback(
    async (productId, productDetails = null) => {
      if (!productId) return;

      // 💎 AUTH-MANDATORY: Ensure user is logged in for curation
      if (!isAuthenticated) {
        alert("🔒 Elite Royale: Please login to manage your Private Collection.");
        return;
      }

      const already = isProductWishlisted(productId);
      const previousWishlist = [...wishlist];

      // Optimistic update
      if (already) {
        setWishlist(prev => prev.filter(item => Number(extractProductId(item)) !== Number(productId)));
      } else {
        const newItem = productDetails ? {
          id: productId,
          product: productDetails,
          product_id: productId,
          ...productDetails
        } : {
          id: productId,
          product_id: productId
        };
        setWishlist(prev => [...prev, newItem]);
      }

      try {
        if (isAuthenticated) {
          if (already) {
            await wishlistService.removeFromWishlist(productId);
          } else {
            await wishlistService.addToWishlist({
              user_id: user?.id,
              product_id: productId,
            });
          }
        }
        // Force refresh from server to ensure IDs are correct (optional but recommended)
        // loadWishlist();
      } catch (error) {
        console.warn("Wishlist API failed, reverting state:", error);
        setWishlist(previousWishlist);
      }
    },
    [isAuthenticated, user, isProductWishlisted, loadWishlist]
  );

  // Local-only remove used by Wishlist page (after a successful API delete)
  const removeItemLocally = useCallback((productId) => {
    setWishlist((prevList) =>
      prevList.filter((item) => {
        const currentId = extractProductId(item);
        return Number(currentId) !== Number(productId);
      })
    );
  }, []);

  const contextValue = useMemo(
    () => ({
      wishlist: Array.isArray(wishlist) ? wishlist : [],
      wishlistCount: (Array.isArray(wishlist) ? wishlist.length : 0),
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

