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
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Normalize product ID from any possible shape
  const extractProductId = (item) => {
    if (!item) return null;
    const product = item.product || item;
    return (
      product?.id ??
      product?.product_id ??
      item.product_id ??
      item.product?.id ??
      item.product?.product_id ??
      null
    );
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
      setWishlist([]);
      return;
    }

    setLoading(true);
    try {
      const data = await wishlistService.fetchWishlist(user.id);
      setWishlist(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isUserLoading) {
      loadWishlist();
    }
  }, [isUserLoading, loadWishlist]);

  // Single source of truth for add/remove
  const toggleWishlist = useCallback(
    async (productId) => {
      if (!productId) return;

      if (!isAuthenticated || !user?.id) {
        alert("Please log in to manage your wishlist.");
        return;
      }

      const already = isProductWishlisted(productId);

      try {
        if (already) {
          // Uses DELETE + { product_id } in body
          await wishlistService.removeFromWishlist(productId);
        } else {
          await wishlistService.addToWishlist({
            user_id: user.id,
            product_id: productId,
          });
        }

        // Always reload from server to keep it in sync
        await loadWishlist();
      } catch (error) {
        console.error("Wishlist toggle failed:", error);
        alert("Failed to update wishlist. Please try again.");
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
      wishlist,
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
