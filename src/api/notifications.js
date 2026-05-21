import apiClient from './index.js';

export const getNotifications = async (params = {}) => {
  try {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
