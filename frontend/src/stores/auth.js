import { defineStore } from "pinia";
import { apiFetch } from "../api/http";

const TOKEN_KEY = "scratchwin_token";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY),
    user: null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    credits: (state) => state.user?.credits ?? 0,
  },
  actions: {
    setSession(token, user = null) {
      this.token = token;
      this.user = user;
      localStorage.setItem(TOKEN_KEY, token);
    },
    clearSession() {
      this.token = null;
      this.user = null;
      localStorage.removeItem(TOKEN_KEY);
    },
    async login(payload) {
      this.loading = true;
      try {
        const response = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        this.setSession(response.token, response.user);
        return response;
      } finally {
        this.loading = false;
      }
    },
    async register(payload) {
      this.loading = true;
      try {
        const response = await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        this.setSession(response.token, response.user);
        return response;
      } finally {
        this.loading = false;
      }
    },
    async fetchProfile() {
      if (!this.token) {
        return null;
      }

      try {
        const response = await apiFetch("/auth/me");
        this.user = response.user;
        return response.user;
      } catch (error) {
        this.clearSession();
        throw error;
      }
    },
    logout() {
      this.clearSession();
    },
  },
});

