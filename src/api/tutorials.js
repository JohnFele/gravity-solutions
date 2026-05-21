import apiClient from "./index.js";

export const getAllTutorials = async () => {
  try {
    const response = await apiClient.get("/tutorials");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getTutorialById = async (tutorialId) => {
  try {
    const response = await apiClient.get(`/tutorials/${tutorialId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const incrementViewCount = async (tutorialId) => {
  try {
    const response = await apiClient.put(`/tutorials/${tutorialId}/view`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateTutorialProgress = async (tutorialId, progressData) => {
  try {
    const response = await apiClient.put(`/tutorials/${tutorialId}/progress`, progressData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createTutorial = async (tutorialData) => {
  try {
    const response = await apiClient.post("/tutorials", tutorialData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateTutorial = async (tutorialId, tutorialData) => {
  try {
    const response = await apiClient.put(`/tutorials/${tutorialId}`, tutorialData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteTutorial = async (tutorialId) => {
  try {
    const response = await apiClient.delete(`/tutorials/${tutorialId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
