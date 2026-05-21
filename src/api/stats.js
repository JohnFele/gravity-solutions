import apiClient from "./index.js";

export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get("/admin/stats");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getChartData = async (chartType) => {
  try {
    const response = await apiClient.get(`/admin/stats/chart-data/${chartType}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateStatsCache = async () => {
  try {
    const response = await apiClient.post("/admin/stats/update-cache");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};