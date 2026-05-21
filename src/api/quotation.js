import apiClient from './index.js';

export const getQuotationPackages = async (params = {}) => {
  try {
    const response = await apiClient.get('/quotations/packages', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createQuotationPackage = async (payload) => {
  try {
    const response = await apiClient.post('/quotations/packages', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateQuotationPackage = async (id, payload) => {
  try {
    const response = await apiClient.put(`/quotations/packages/${id}`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteQuotationPackage = async (id) => {
  try {
    const response = await apiClient.delete(`/quotations/packages/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleQuotationPackagePublish = async (id) => {
  try {
    const response = await apiClient.patch(`/quotations/packages/${id}/publish`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getQuotationAddOns = async (params = {}) => {
  try {
    const response = await apiClient.get('/quotations/add-ons', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createQuotationAddOn = async (payload) => {
  try {
    const response = await apiClient.post('/quotations/add-ons', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateQuotationAddOn = async (id, payload) => {
  try {
    const response = await apiClient.put(`/quotations/add-ons/${id}`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteQuotationAddOn = async (id) => {
  try {
    const response = await apiClient.delete(`/quotations/add-ons/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleQuotationAddOnPublish = async (id) => {
  try {
    const response = await apiClient.patch(`/quotations/add-ons/${id}/publish`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createQuote = async (payload) => {
  try {
    const response = await apiClient.post('/quotations/quotes', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateQuote = async (id, payload) => {
  try {
    const response = await apiClient.put(`/quotations/quotes/${id}`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getQuoteHistory = async (params = {}) => {
  try {
    const response = await apiClient.get('/quotations/quotes', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const downloadQuotePdf = async (id) => {
  try {
    const response = await apiClient.get(`/quotations/quotes/${id}/pdf`, {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf',
      },
    });
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateQuoteStatus = async (id, status) => {
  try {
    const response = await apiClient.patch(`/quotations/quotes/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getQuotationStats = async () => {
  try {
    const response = await apiClient.get('/quotations/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
