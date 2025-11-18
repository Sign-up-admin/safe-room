import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { UserInfo } from "@/types/user";

export const useUserStore = defineStore("user", () => {
  // 状态
  const userInfo = ref<UserInfo | null>(null);
  const token = ref<string>("");
  const isAuthenticated = ref<boolean>(false);

  // 计算属性
  const username = computed(() => userInfo.value?.username || "");
  const userRole = computed(() => userInfo.value?.role || null);
  const displayName = computed(
    () => userInfo.value?.name || userInfo.value?.username || "访客",
  );

  // 方法
  function setUserInfo(info: UserInfo) {
    userInfo.value = info;
    if (info.token) {
      token.value = info.token;
      localStorage.setItem("token", info.token);
    }
    isAuthenticated.value = true;
  }

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem("token", newToken);
    isAuthenticated.value = !!newToken;
  }

  function logout() {
    userInfo.value = null;
    token.value = "";
    isAuthenticated.value = false;
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
  }

  function initUser() {
    const savedToken = localStorage.getItem("token");
    const savedUserInfo = localStorage.getItem("userInfo");

    if (savedToken) {
      token.value = savedToken;
      isAuthenticated.value = true;
    }

    if (savedUserInfo) {
      try {
        userInfo.value = JSON.parse(savedUserInfo);
      } catch (e) {
        console.error("Failed to parse user info:", e);
      }
    }
  }

  return {
    // 状态
    userInfo,
    token,
    isAuthenticated,
    // 计算属性
    username,
    userRole,
    displayName,
    // 方法
    setUserInfo,
    setToken,
    logout,
    initUser,
  };
});
