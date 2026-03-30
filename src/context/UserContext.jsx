// src/context/UserContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { User } from "lucide-react";

// API
import { authService } from "../api/authService";
import { setAuthToken } from "../api/api";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const AUTH_STORAGE_KEY = "ecom_auth_data";

  const [userSession, setUserSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ====================================
  // INIT FROM LOCAL STORAGE
  // ====================================
  useEffect(() => {
    // 💎 LEAN-TOKEN ARCHITECTURE: Construct session from standalone markers
    const accessToken = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");
    const rawProfile = localStorage.getItem("user_profile");

    if (!accessToken || !userId) {
      setUserSession(null);
      setIsLoading(false);
      return;
    }

    try {
      let profile = { id: userId };
      if (rawProfile && rawProfile !== "undefined") {
        profile = JSON.parse(rawProfile);
      }
      
      const session = { access: accessToken, user: profile };
      setUserSession(session);
    } catch (e) {
      console.error("Session reconstruction failed:", e);
      setUserSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ====================================
  // HANDLE LOGIN / REGISTER SUCCESS
  // ====================================
  const handleLoginSuccess = (data) => {
    if (!data) return;

    // Search deep for nested tokens if present
    const payload = data.data || data;
    const tokens = payload.tokens || payload;

    // Dynamic extraction
    const accessToken = tokens.access || tokens.token || tokens.access_token || tokens.jwt_token || tokens.accessToken || payload.access_token || payload.access || payload.token || null;
    const refreshToken = tokens.refresh || tokens.refresh_token || tokens.refreshToken || payload.refresh_token || payload.refresh || null;
    
    // Dynamic UserId extraction (Check root payload)
    const userObj = payload.user || payload.customer || payload;
    let userId = userObj?.id || userObj?.user_id || payload.user_id || payload.id || null;

    // If backend only returns tokens and hides the user_id, decrypt from JWT
    if (!userId && accessToken) {
        try {
            const base64Url = accessToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decodedJwt = JSON.parse(jsonPayload);
            userId = decodedJwt.user_id || decodedJwt.id || decodedJwt.sub || null;
        } catch (e) {
            console.warn("Could not decrypt JWT for user_id lookup.", e);
        }
    }

    // Save tokens
    if (accessToken) {
        localStorage.setItem("accessToken", String(accessToken));
        localStorage.setItem("access_token", String(accessToken));
        setAuthToken(accessToken);
    }

    if (userId) {
        localStorage.setItem("user_id", String(userId));
    }

    // Determine the user object for session state
    let finalUser = payload.user || payload.customer || null;
    if (!finalUser && (payload.id || payload.user_id || payload.username)) finalUser = payload;
    if (!finalUser && userId) finalUser = { id: userId };

    // Normalize field names — backend may use different keys
    if (finalUser) {
        // Mobile: backend may return as mobile, phone, phone_number
        if (!finalUser.mobile_number) {
            finalUser.mobile_number = finalUser.mobile || finalUser.phone || finalUser.phone_number || "";
        }
        // Username: backend may return as name, full_name, first_name
        if (!finalUser.username) {
            finalUser.username = finalUser.name || finalUser.full_name || finalUser.first_name || "";
        }
        // Email: backend may return as email_address
        if (!finalUser.email) {
            finalUser.email = finalUser.email_address || "";
        }

        localStorage.setItem("user_profile", JSON.stringify(finalUser));
    }

    const session = { access: accessToken, user: finalUser };
    setUserSession(session);
    
    console.log("✅ [UserContext] Session Synchronized", { userId, hasToken: !!accessToken, user: finalUser });
  };

  // ====================================
  // LOGIN
  // ====================================
  const login = async (mobile_number, password) => {
    setIsLoading(true);
    try {
      const data = await authService.login(mobile_number, password);
      handleLoginSuccess(data);
      return data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ====================================
  // REGISTER
  // ====================================
  const register = async (payload) => {
    setIsLoading(true);
    try {
      const data = await authService.register(payload);
      handleLoginSuccess(data);
      return data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ====================================
  // LOGOUT
  // ====================================
  const logout = () => {
    // 1. Call service logout for API side cleanup
    authService.logout();

    // 2. Consolidate absolute local storage scrub
    const keysToWash = [
      AUTH_STORAGE_KEY,
      "accessToken", "access_token",
      "refreshToken", "refresh_token",
      "user_id", "user",
      "localCart", "localWishlist",
      "latitude", "longitude"
    ];
    
    keysToWash.forEach(key => localStorage.removeItem(key));

    // 3. Reset internal state
    setUserSession(null);
    console.log("🚀 [UserContext] Security Scrub Complete — User Logged Out");
  };

  // ====================================
  // CONTEXT VALUE
  // ====================================
  const contextValue = useMemo(
    () => {
      const authState = !!userSession?.user;
      console.log("Auth State Updated:", authState, userSession?.user?.username || userSession?.user?.id);
      return {
        isAuthenticated: authState,
        user: userSession?.user || null,
        accessToken: userSession?.access || null,
        isLoading,

        login,
        register,
        handleLoginSuccess,
        logout,
      };
    },
    [userSession, isLoading]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <User size={24} className="animate-pulse mr-2" />
        Initializing Session...
      </div>
    );
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
