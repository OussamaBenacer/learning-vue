import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { refreshApi } from "@/services/auth";
import router from "@/router";

const api = axios.create({
  baseURL: "https://api.escuelajs.co/api/v1",
  timeout: 10000,
});

// add token in the request if exist
api.interceptors.request.use(
  (config) => {
    const auth = useAuthStore();
    if (auth.accessToken) {
      config.headers["Authorization"] = `Bearer ${auth.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// try to refresh the token and resend the request . if the token expires
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshApi();
        return api(originalRequest);
      } catch (err) {
        console.error("Refresh token failed", err);
        // expired session
        alert("Your session has expired, please login again.");
        const auth = useAuthStore();
        auth.logout();
        router.push("/");
      }
    }
    return Promise.reject(error);
  },
);

export default api;
