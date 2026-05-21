import { useCallback, useState } from 'react';
import { ProfileContext } from './ProfileContext';
import { getUserProfile } from '../api/user';

export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  
  const fetchProfile = useCallback(async (force = false) => {
    const now = new Date();

    if (!force && profileData && lastFetched && (now - lastFetched < 5 * 60 * 1000)) {
      return profileData;
    }
    
    try {
      setIsLoading(true);
      const res = await getUserProfile();
      setProfileData(res.data);
      setLastFetched(now);
      setError(null);
      return res.data;
    } catch (error) {
      setError(error);
      setProfileData(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [profileData, lastFetched]);

  const updateProfile = (newData) => {
    setProfileData(prev => ({ ...prev, ...newData }));
  }

  return (
    <ProfileContext.Provider
      value={{
        profileData,
        setProfileData: updateProfile,
        isLoading,
        error,
        fetchProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};