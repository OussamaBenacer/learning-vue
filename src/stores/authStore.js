import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const accessToken = ref("");
    const refreshToken = ref("");

    const tokensAvailable = computed(() => !!(accessToken.value && refreshToken.value));

    function setTokens(accessT, refreshT) {
      accessToken.value = accessT;
      refreshToken.value = refreshT;
    }

    function logout() {
      setTokens("", "");
    }

    return { accessToken, refreshToken, tokensAvailable, setTokens, logout };
  },
  { persist: true },
);
