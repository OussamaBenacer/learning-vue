import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const accessToken = ref("");
    const refreshToken = ref("");

    const tokensAvailable = computed(() => !!(accessToken.value && refreshToken.value));
    const isSessionEnd = ref(true);

    function setTokens(accessT, refreshT) {
      accessToken.value = accessT;
      refreshToken.value = refreshT;
    }

    function logout() {
      setTokens("", "");
    }

    return { accessToken, refreshToken, tokensAvailable, isSessionEnd, setTokens, logout };
  },
  { persist: true },
);
