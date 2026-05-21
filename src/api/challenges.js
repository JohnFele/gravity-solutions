import apiClient from './index.js';

export const getChallenges = async (params = {}) => {
  try {
    const response = await apiClient.get('/challenges', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getChallengeById = async (challengeId) => {
  try {
    const response = await apiClient.get(`/challenges/${challengeId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createChallenge = async (challengeData) => {
  try {
    const response = await apiClient.post('/challenges', challengeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateChallenge = async (challengeId, challengeData) => {
  try {
    const response = await apiClient.put(`/challenges/${challengeId}`, challengeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteChallenge = async (challengeId) => {
  try {
    const response = await apiClient.delete(`/challenges/${challengeId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const participateInChallenge = async (challengeId) => {
  try {
    const response = await apiClient.put(`/challenges/${challengeId}/participate`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
