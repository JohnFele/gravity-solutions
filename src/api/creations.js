import apiClient from './index.js';

export const getCreations = async (params = {}) => {
  try {
    const response = await apiClient.get('/creations', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCreationById = async (creationId) => {
  try {
    const response = await apiClient.get(`/creations/${creationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createCreation = async (creationData) => {
  try {
    const response = await apiClient.post('/creations', creationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCreation = async (creationId, creationData) => {
  try {
    const response = await apiClient.put(`/creations/${creationId}`, creationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteCreation = async (creationId) => {
  try {
    const response = await apiClient.delete(`/creations/${creationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const incrementCreationView = async (creationId) => {
  try {
    const response = await apiClient.put(`/creations/${creationId}/view`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleCreationLike = async (creationId) => {
  try {
    const response = await apiClient.put(`/creations/${creationId}/like`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
