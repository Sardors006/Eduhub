import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, {
  refreshClient,
  registerAuthCallbacks,
  setAuthAccessToken,
} from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [tokenIssuedAt, setTokenIssuedAt] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const clearSession = useCallback(() => {
    setAuthAccessToken(null);
    setAccessToken(null);
    setUser(null);
    setTokenIssuedAt(null);
  }, []);

  const applySession = useCallback(({ accessToken: token, user: nextUser, issuedAt }) => {
    setAuthAccessToken(token);
    setAccessToken(token);
    if (nextUser) {
      setUser(nextUser);
    }
    setTokenIssuedAt(issuedAt || new Date().toISOString());
  }, []);

  // Wire Axios interceptor callbacks to keep React state in sync during silent refreshes
  useEffect(() => {
    registerAuthCallbacks({
      onTokenRefreshed: ({ accessToken: newToken, user: refreshedUser, issuedAt }) => {
        applySession({ accessToken: newToken, user: refreshedUser, issuedAt });
      },
      onAuthFailure: () => {
        clearSession();
      },
    });
  }, [applySession, clearSession]);

  // Attempt silent session restoration on initial page load using the HttpOnly refresh cookie
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const { data } = await refreshClient.post('/auth/refresh');
        if (isMounted && data?.accessToken) {
          applySession({
            accessToken: data.accessToken,
            user: data.user,
            issuedAt: data.issuedAt || new Date().toISOString(),
          });
        }
      } catch {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [applySession, clearSession]);

  const register = useCallback(async ({ email, password }) => {
    const { data } = await api.post('/auth/register', { email, password });
    return data;
  }, []);

  const verifyEmail = useCallback(async ({ email, code }) => {
    const { data } = await api.post('/auth/verify', { email, code });
    return data;
  }, []);

  const resendCode = useCallback(async (email) => {
    const { data } = await api.post('/auth/resend-code', { email });
    return data;
  }, []);

  const login = useCallback(
    async ({ email, password }) => {
      const { data } = await api.post('/auth/login', { email, password });
      applySession({
        accessToken: data.accessToken,
        user: data.user,
        issuedAt: data.issuedAt || new Date().toISOString(),
      });
      return data;
    },
    [applySession]
  );

  const refreshAccessToken = useCallback(async () => {
    const { data } = await api.post('/auth/refresh');
    const issuedAt = data.issuedAt || new Date().toISOString();
    applySession({
      accessToken: data.accessToken,
      user: data.user,
      issuedAt,
    });
    return {
      accessToken: data.accessToken,
      user: data.user,
      issuedAt,
    };
  }, [applySession]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      tokenIssuedAt,
      initializing,
      isAuthenticated: Boolean(user && accessToken),
      isAdmin: user?.role === 'admin',
      register,
      verifyEmail,
      resendCode,
      login,
      logout,
      refreshAccessToken,
    }),
    [
      user,
      accessToken,
      tokenIssuedAt,
      initializing,
      register,
      verifyEmail,
      resendCode,
      login,
      logout,
      refreshAccessToken,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

