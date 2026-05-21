import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import apiClient, { requestTokenRefresh } from "../api/index";
import { tokenStorage } from "../api/accessToken";
import { API_ENDPOINTS } from "../api/apiEndpoints";

const normalizeUser = (payload) => payload?.data?.user ?? payload?.user ?? payload?.data ?? payload ?? null;
const extractAccessToken = (payload) => payload?.data?.accessToken ?? payload?.accessToken ?? null;

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateUser = useCallback((nextUser) => {
    setUser((prev) => {
      if (typeof nextUser === "function") {
        return nextUser(prev);
      }

      if (!nextUser) return null;
      return { ...(prev ?? {}), ...nextUser };
    });
  }, []);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.user.profile);
      const nextUser = normalizeUser(res.data);
      setUser(nextUser);
      return nextUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const res = await requestTokenRefresh();
      const refreshedAccessToken = extractAccessToken(res.data);
      if (refreshedAccessToken) {
        tokenStorage.setToken(refreshedAccessToken);
      } else {
        tokenStorage.clearToken();
      }
      return await fetchUser();
    } catch {
      tokenStorage.clearToken();
      setUser(null);
      return null;
    } finally {
      setAuthReady(true);
    }
  }, [fetchUser]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const finalizeLogin = useCallback(async (res) => {
    const accessToken = extractAccessToken(res.data);
    if (accessToken) {
      tokenStorage.setToken(accessToken);
    } else {
      tokenStorage.clearToken();
    }
    const nextUser = normalizeUser(res.data);
    setUser(nextUser);
    return nextUser;
  }, []);

  const navigateByRole = useCallback((nextUser) => {
    const role = String(nextUser?.role || "").toLowerCase();

    if (!role) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    navigate("/user/dashboard", { replace: true });
  }, [navigate]);

  const login = useCallback(async (payload) => {
    setLoading(true);
    try {
      const res = await apiClient.post(API_ENDPOINTS.auth.signIn, payload);
      const nextUser = await finalizeLogin(res);
      navigateByRole(nextUser);
      return { success: true, user: nextUser };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message,
        error: err?.response?.data ?? err,
      };
    } finally {
      setLoading(false);
    }
  }, [finalizeLogin, navigateByRole]);

  const signup = useCallback(async (payload) => {
    setLoading(true);
    try {
      const res = await apiClient.post(API_ENDPOINTS.auth.signUp, payload);
      const nextUser = await finalizeLogin(res);
      navigateByRole(nextUser);
      return { success: true, user: nextUser };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message,
        error: err?.response?.data ?? err,
      };
    } finally {
      setLoading(false);
    }
  }, [finalizeLogin, navigateByRole]);

  const googleLogin = useCallback(async (credential) => {
    setLoading(true);
    try {
      const res = await apiClient.post(API_ENDPOINTS.auth.googleAuth, { credential });
      const nextUser = await finalizeLogin(res);
      navigateByRole(nextUser);
      return { success: true, user: nextUser };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message,
        error: err?.response?.data ?? err,
      };
    } finally {
      setLoading(false);
    }
  }, [finalizeLogin, navigateByRole]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.auth.signOut);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message,
        error: err?.response?.data ?? err,
      };
    } finally {
      tokenStorage.clearToken();
      setUser(null);
      setLoading(false);
      navigate("/auth/login", { replace: true });
    }
  }, [navigate]);

  const value = useMemo(() => ({
    user,
    profileData: user,
    isAuthenticated: !!user,
    authReady,
    loading,
    isLoading: loading,
    setUser: updateUser,
    setProfileData: updateUser,
    fetchUser,
    fetchProfile: fetchUser,
    refreshSession,
    login,
    signup,
    googleLogin,
    logout,
    navigateByRole,
  }), [
    user,
    authReady,
    loading,
    updateUser,
    fetchUser,
    refreshSession,
    login,
    signup,
    googleLogin,
    logout,
    navigateByRole,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


