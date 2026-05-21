let accessToken = null;

export const tokenStorage = {
  getToken: () => accessToken,
  setToken: (token) => {
    accessToken = token;
  },
  clearToken: () => {
    accessToken = null;
  },
};
