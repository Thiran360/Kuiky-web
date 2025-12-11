import { createContext, useContext, useState, useEffect } from "react";
import { profileService } from "../api/profileService";
import { useUser } from "../../src/context/UserContext";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { accessToken } = useUser();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ============================
  // FETCH PROFILE (GET /profiles/me/)
  // ============================
  const loadProfile = async () => {
    if (!accessToken) return;
    setLoadingProfile(true);

    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Profile Load Failed:", error);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Load profile on mount or when token changes
  useEffect(() => {
    if (accessToken) {
      loadProfile();
    }
  }, [accessToken]);

  // ============================
  // UPDATE & SAVE PROFILE
  // ============================
  const updateProfile = async (payload) => {
    try {
      const updated = await profileService.updateProfile(payload);
      setProfile(updated); // immediately update UI
      return updated;
    } catch (error) {
      console.error("Update Profile Failed:", error);
      throw error;
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loadingProfile,
        updateProfile,
        reloadProfile: loadProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);