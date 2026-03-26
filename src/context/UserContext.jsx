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
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw || raw === "undefined" || raw === "null") {
      setUserSession(null);
      setIsLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw);

      if (parsed && (parsed.user || parsed.id || parsed.username)) {
        // Restore session
        const session = parsed.user ? parsed : { access: parsed.access || null, user: parsed };
        setUserSession(session);
      } else {
        throw new Error("Invalid auth shape");
      }
    } catch (e) {
      console.error("Corrupted auth storage. Clearing...", e);
      localStorage.removeItem(AUTH_STORAGE_KEY);
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

    // 🔥 If backend only returns tokens and hides the user_id, forcefully decrypt it from the JWT Access Token!
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

    // Ensure we force save to Local Storage exactly as requested by the user
    if (accessToken) {
        localStorage.setItem("accessToken", String(accessToken));
        localStorage.setItem("access_token", String(accessToken));
        setAuthToken(accessToken); // Immediately update Axios defaults
    }
    
    if (refreshToken) {
        localStorage.setItem("refreshToken", String(refreshToken));
        localStorage.setItem("refresh_token", String(refreshToken));
    }

    if (userId) {
        localStorage.setItem("user_id", String(userId));
    }

    // Determine the user object for session state
    let finalUser = payload.user || payload.customer || null;
    if (!finalUser && (payload.id || payload.user_id || payload.username)) finalUser = payload;
    if (!finalUser && userId) finalUser = { id: userId };

    const session = { access: accessToken, user: finalUser };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    setUserSession(session);
    
    console.log("✅ [UserContext] Session Synchronized", { userId, hasToken: !!accessToken });
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
