import apiClient from "./index.js";
import { API_ENDPOINTS } from "./apiEndpoints";

export const getAllUsers = async ({ page, limit, search, role, status, sort, order, includeDeleted }) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.admin.users, {
      params: {
        page: page || 1,
        limit: limit || 10,
        search: search,
        role: role,
        status: status,
        sort: sort,
        order: order,
        includeDeleted: includeDeleted
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.admin.userById(userId));
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const softDeleteUser = async (userId) => {
  try {
    const response = await apiClient.put(API_ENDPOINTS.admin.userById(userId));
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const restoreUser = async (userId) => {
  try {
    const response = await apiClient.put(API_ENDPOINTS.admin.restoreUser(userId));
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const updateUserRole = async (userId, role) => {
  try {
    const response = await apiClient.put(API_ENDPOINTS.admin.updateUserRole(userId), { role });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export const updateUserDetails = async (userId, payload) => {
  try {
    const response = await apiClient.put(API_ENDPOINTS.admin.updateUserDetails(userId), payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const permanentlyDeleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(API_ENDPOINTS.admin.deleteUser(userId));
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
