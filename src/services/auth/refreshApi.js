import { useAuthStore } from "@/stores/authStore";
import api from "../api";

export async function refreshApi() {
  const auth = useAuthStore();
  if (!auth.tokensAvailable) throw new Error("no refresh token");

  try {
    const res = await api.post("/auth/refresh-token", { refreshToken: auth.refreshToken });
    const { access_token, refresh_token } = res.data;
    auth.setTokens(access_token, refresh_token);
  } catch (err) {
    if (err.response?.status == 401) err.message = "expired refresh token";
    else err.message = err?.response?.data?.message || err.message;
    throw err;
  }
}
