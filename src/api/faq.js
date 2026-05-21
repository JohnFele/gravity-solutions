import apiClient from './index.js';

export const getAllFAQs = async () => {
  try {
    const response = await apiClient.get('/faq');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const getFaqById = async (faqId) => {
  try {
    const response = await apiClient.get(`/faq/${faqId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const getFaqsByCategory = async (category) => {
  try {
    const response = await apiClient.get(`/faq/category/${category}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const createFaq = async (faqData) => {
  try {
    const response = await apiClient.post('/faq', faqData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const updateFaq = async (faqId, faqData) => {
  try {
    const response = await apiClient.put(`/faq/${faqId}`, faqData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const deleteFaq = async (faqId) => {
  try {
    const response = await apiClient.delete(`/faq/${faqId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const sendContactForm = async (formData) => {
  try {
    const response = await apiClient.post('/contact', formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}