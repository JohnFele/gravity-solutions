// src/api/apiEndpoints.js

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const API_ENDPOINTS = {
  base: API_BASE_URL,

  auth: {
    signUp: `${API_BASE_URL}/auth/sign-up`,
    signIn: `${API_BASE_URL}/auth/sign-in`,
    signOut: `${API_BASE_URL}/auth/sign-out`,
    sendVerificationOtp: `${API_BASE_URL}/auth/send-verification-otp`,
    verifyAccount: `${API_BASE_URL}/auth/verify-account`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPasswordOtp: `${API_BASE_URL}/auth/reset-password-otp`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
    googleAuth: `${API_BASE_URL}/auth/google-auth`,
    refreshToken: `${API_BASE_URL}/auth/refresh-token`,
  },

  user: {
    profile: `${API_BASE_URL}/user/profile`,
    stats: `${API_BASE_URL}/user/stats`,
  },

  admin: {
    users: `${API_BASE_URL}/admin/users`,
    userById: (id) => `${API_BASE_URL}/admin/users/${id}`,
    restoreUser: (id) => `${API_BASE_URL}/admin/users/${id}/restore`,
    updateUserRole: (id) => `${API_BASE_URL}/admin/users/${id}/role`,
    updateUserDetails: (id) => `${API_BASE_URL}/admin/users/${id}/details`,
    deleteUser: (id) => `${API_BASE_URL}/admin/users/${id}`,
  },

  adminStats: {
    dashboard: `${API_BASE_URL}/admin/stats`,
    chartData: (chartType) =>
      `${API_BASE_URL}/admin/stats/chart-data/${chartType}`,
    updateCache: `${API_BASE_URL}/admin/stats/update-cache`,
  },

  faq: {
    all: `${API_BASE_URL}/faq`,
    byId: (id) => `${API_BASE_URL}/faq/${id}`,
    byCategory: (category) => `${API_BASE_URL}/faq/category/${category}`,
    create: `${API_BASE_URL}/faq`,
    update: (id) => `${API_BASE_URL}/faq/${id}`,
    delete: (id) => `${API_BASE_URL}/faq/${id}`,
  },

  contact: {
    send: `${API_BASE_URL}/contact`,
  },

  tutorials: {
    all: `${API_BASE_URL}/tutorials`,
    byId: (id) => `${API_BASE_URL}/tutorials/${id}`,
    incrementView: (id) => `${API_BASE_URL}/tutorials/${id}/view`,
    create: `${API_BASE_URL}/tutorials`,
    update: (id) => `${API_BASE_URL}/tutorials/${id}`,
    delete: (id) => `${API_BASE_URL}/tutorials/${id}`,
  },
};
