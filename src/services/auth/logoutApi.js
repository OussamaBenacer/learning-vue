import { useAuthStore } from "@/stores/authStore";

export const logoutApi = async () => {
  const auth = useAuthStore();
  auth.logout();

  // there is no endpoint for logout (remove refresh token from db)
};
