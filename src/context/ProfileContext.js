import { createContext, useContext } from 'react';

export const ProfileContext = createContext();

export const useAuth = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useAuth must be used within a ProfileProvider');
  }
  return context;
};
