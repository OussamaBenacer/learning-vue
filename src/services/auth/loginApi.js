import { useAuthStore } from "@/stores/authStore";
import api from "../api";

export async function loginApi(email, password) {
  try {
    const res = await api.post("/auth/login", { email, password });
    const { access_token, refresh_token } = res.data;

    const auth = useAuthStore();
    auth.setTokens(access_token, refresh_token);

  } catch (err) {
    if (err.response?.status == 401) err.message = "Invalid credentials";
    else err.message = err?.response?.data?.message || err.message;
    throw err;
  }
}
