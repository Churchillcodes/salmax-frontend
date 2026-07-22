import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3500";

let accessToken = "";

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue = [];

const isAuthEndpoint = (url = "") => /\/auth\/(login|refresh|logout)/.test(url);

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

const RETRYABLE_STATUSES = [502, 503, 504];
const MAX_RETRIES = 2;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // --- 401: attempt a token refresh once, queueing concurrent requests ---
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.get(`${API_BASE_URL}/auth/refresh`, {
          withCredentials: true,
          timeout: 5000,
        });

        const newAccessToken = response.data.accessToken;
        setAccessToken(newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken("");
        return Promise.reject({ ...refreshError, isRefreshFailed: true });
      } finally {
        isRefreshing = false;
      }
    }

    // --- Network errors / transient 502-504 on GET requests: retry with backoff ---
    const isNetworkOrServerError =
      !error.response || RETRYABLE_STATUSES.includes(error.response.status);
    const isIdempotentGet =
      (originalRequest.method || "get").toLowerCase() === "get";
    const isAuthCall = isAuthEndpoint(originalRequest.url || "");

    if (isNetworkOrServerError && isIdempotentGet && !isAuthCall) {
      originalRequest._retryCount = originalRequest._retryCount || 0;

      if (originalRequest._retryCount < MAX_RETRIES) {
        originalRequest._retryCount += 1;
        await wait(400 * originalRequest._retryCount);
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
