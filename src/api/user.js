import apiClient from "./index.js";

export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/user/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserStats = async () => {
  try {
    const response = await apiClient.get('/user/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserRecentActivity = async (params = {}) => {
  try {
    const response = await apiClient.get('/user/activities', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/user/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
