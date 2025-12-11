// src/context/UserContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { User } from "lucide-react";

import { setAuthToken } from "../api/api";
import { authService } from "../api/authService";

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
      setAuthToken(null);
      setUserSession(null);
      setIsLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw);

      if (parsed && parsed.user) {
        // Restore token (may be null in your backend flow)
        if (parsed.access) {
          setAuthToken(parsed.access);
          localStorage.setItem("accessToken", parsed.access);
        } else {
          setAuthToken(null);
        }

        // Restore session
        setUserSession(parsed);
      } else {
        throw new Error("Invalid auth shape");
      }
    } catch (e) {
      console.error("Corrupted auth storage. Clearing...", e);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthToken(null);
      setUserSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ====================================
  // HANDLE LOGIN / REGISTER SUCCESS
  // ====================================
  const handleLoginSuccess = (data) => {
    if (!data) {
      console.error("handleLoginSuccess received empty data");
      return;
    }

    // Backend may give token OR may not.
    const token =
      data.access ||
      data.token ||
      data.access_token ||
      data.key ||
      localStorage.getItem("accessToken") ||
      null;

    const user = data.user || null;

    if (!user) {
      console.error("handleLoginSuccess: user missing in response", data);
      return;
    }

    // Apply token to axios if exists
    if (token) {
      setAuthToken(token);
      localStorage.setItem("accessToken", token);
    } else {
      console.warn("No token found — storing session without token.");
      setAuthToken(null);
    }

    const session = { access: token, user };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    setUserSession(session);
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
    setAuthToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("accessToken");
    setUserSession(null);
  };

  // ====================================
  // CONTEXT VALUE
  // ====================================
  const contextValue = useMemo(
    () => ({
      isAuthenticated: !!userSession?.user,
      user: userSession?.user || null,
      accessToken: userSession?.access || null,
      isLoading,

      login,
      register,
      handleLoginSuccess,
      logout,
    }),
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
