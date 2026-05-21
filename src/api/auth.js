import apiClient from "./index.js";

export const logIn = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/sign-in', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const signUp = async (userData) => {
  try {
    const response = await apiClient.post('/auth/sign-up', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logOut = async () => {
  try {
    const response = await apiClient.post('/auth/sign-out');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const requestPasswordReset = async (payload) => {
  try {
    const response = await apiClient.post('/auth/forgot-password', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verifyPasswordResetOTP = async (payload) => {
  try {
    const response = await apiClient.post('/auth/reset-password-otp', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const resetPassword = async (payload) => {
  try {
    const response = await apiClient.post('/auth/reset-password', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const requestEmailVerification = async (payload) => {
  try {
    const response = await apiClient.post('/auth/send-verification-otp', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verifyEmailOTP = async (payload) => {
  try {
    const response = await apiClient.post('/auth/verify-account', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const googleLogin = async (credential) => {
  try {
    const response = await apiClient.post('/auth/google-auth', { credential });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const googleSignIn = async (credential) => {
  return googleLogin(credential);
};
