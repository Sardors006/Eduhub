import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Primary Axios instance used across the application
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dedicated bare instance for /auth/refresh to avoid recursive interceptor loops
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory access token storage (synchronized with React AuthContext state)
let inMemoryAccessToken = null;
let onTokenRefreshedCallback = null;
let onAuthFailureCallback = null;

export const setAuthAccessToken = (token) => {
  inMemoryAccessToken = token || null;
};

export const getAuthAccessToken = () => inMemoryAccessToken;

export const registerAuthCallbacks = ({ onTokenRefreshed, onAuthFailure }) => {
  onTokenRefreshedCallback = onTokenRefreshed || null;
  onAuthFailureCallback = onAuthFailure || null;
};

// Request Interceptor: Attach Bearer token from memory
api.interceptors.request.use(
  (config) => {
    if (inMemoryAccessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Single-flight refresh queue to handle concurrent 401 responses gracefully
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const AUTH_ENDPOINTS_TO_SKIP = [
  '/auth/login',
  '/auth/register',
  '/auth/verify',
  '/auth/resend-code',
  '/auth/refresh',
  '/auth/logout',
];

// Response Interceptor: Silently refresh expired 15m Access Token on HTTP 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';
    const shouldSkipRefresh = AUTH_ENDPOINTS_TO_SKIP.some((path) =>
      requestUrl.includes(path)
    );

    if (error.response.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((queueError) => Promise.reject(queueError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await refreshClient.post('/auth/refresh');
        const newAccessToken = data.accessToken;

        inMemoryAccessToken = newAccessToken;

        if (onTokenRefreshedCallback) {
          onTokenRefreshedCallback({
            accessToken: newAccessToken,
            user: data.user,
            issuedAt: data.issuedAt || new Date().toISOString(),
          });
        }

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        inMemoryAccessToken = null;
        processQueue(refreshError, null);

        if (onAuthFailureCallback) {
          onAuthFailureCallback();
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { refreshClient };

