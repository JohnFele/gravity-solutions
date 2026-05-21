import axios from 'axios';
import { tokenStorage } from './accessToken.js';
import { API_BASE_URL, API_ENDPOINTS } from './apiEndpoints.js';

const baseURL = API_BASE_URL;

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export const requestTokenRefresh = () => refreshClient.post(API_ENDPOINTS.auth.refreshToken);

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (!err.response || err.response.status !== 401) {
      return Promise.reject(err);
    }

    if (originalRequest?.url?.includes(API_ENDPOINTS.auth.refreshToken)) {
      tokenStorage.clearToken();
      return Promise.reject(err);
    }

    if (originalRequest._retry) {
      tokenStorage.clearToken();
      return Promise.reject(err);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await requestTokenRefresh();
      const newToken = response?.data?.data?.accessToken ?? response?.data?.accessToken;

      if (!newToken) throw new Error('No access token returned from refresh');

      tokenStorage.setToken(newToken);
      processQueue(null, newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenStorage.clearToken();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
