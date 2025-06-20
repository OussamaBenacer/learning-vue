import { useAuthStore } from "@/stores/authStore";
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.escuelajs.co/api/v1",
  timeout: 10000,
});

// add token if exist
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

export default api;
