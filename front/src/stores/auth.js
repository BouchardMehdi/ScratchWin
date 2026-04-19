import { defineStore } from "pinia";
import {
  ACCESS_TOKEN_KEY,
  LAST_REFRESH_AT_KEY,
  REFRESH_TOKEN_KEY,
  SESSION_EXPIRED_EVENT,
  SESSION_REFRESHED_EVENT,
  apiFetch,
} from "../api/http";

const REFRESH_INTERVAL_MS = 2 * 60 * 60 * 1000;

let refreshTimeoutId = null;
let maintenanceAttached = false;

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    lastRefreshAt: Number(localStorage.getItem(LAST_REFRESH_AT_KEY) || 0),
    user: null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token || state.refreshToken),
    credits: (state) => state.user?.credits ?? 0,
  },
  actions: {
    setSession(session) {
      const token = session.token;
      const refreshedAt = session.refreshedAt || Date.now();

      this.token = token;
      this.refreshToken = session.refreshToken ?? this.refreshToken;
      this.user = session.user ?? this.user;
      this.lastRefreshAt = refreshedAt;
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      localStorage.setItem(REFRESH_TOKEN_KEY, this.refreshToken);
      localStorage.setItem(LAST_REFRESH_AT_KEY, String(refreshedAt));
      this.scheduleRefresh();
    },
    clearSession() {
      this.token = null;
      this.refreshToken = null;
      this.lastRefreshAt = 0;
      this.user = null;
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(LAST_REFRESH_AT_KEY);
      if (refreshTimeoutId) {
        clearTimeout(refreshTimeoutId);
        refreshTimeoutId = null;
      }
    },
    scheduleRefresh() {
      if (refreshTimeoutId) {
        clearTimeout(refreshTimeoutId);
      }

      if (!this.refreshToken) {
        return;
      }

      const elapsed = Date.now() - this.lastRefreshAt;
      const delay = Math.max(10_000, REFRESH_INTERVAL_MS - elapsed);

      refreshTimeoutId = window.setTimeout(() => {
        this.refreshSession().catch(() => {});
      }, delay);
    },
    attachSessionMaintenance() {
      if (maintenanceAttached) {
        return;
      }

      maintenanceAttached = true;

      document.addEventListener("visibilitychange", () => {
        if (
          document.visibilityState === "visible" &&
          this.refreshToken &&
          Date.now() - this.lastRefreshAt >= REFRESH_INTERVAL_MS
        ) {
          this.refreshSession().catch(() => {});
        }
      });

      window.addEventListener(SESSION_REFRESHED_EVENT, (event) => {
        this.token = event.detail.token;
        this.refreshToken = event.detail.refreshToken;
        this.lastRefreshAt = event.detail.refreshedAt;
        if (event.detail.user) {
          this.user = event.detail.user;
        }
        this.scheduleRefresh();
      });

      window.addEventListener(SESSION_EXPIRED_EVENT, () => {
        this.clearSession();
      });
    },
    async login(payload) {
      this.loading = true;
      try {
        const response = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify(payload),
          skipAuthRefresh: true,
        });
        this.setSession({
          token: response.token,
          refreshToken: response.refreshToken,
          user: response.user,
        });
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
          skipAuthRefresh: true,
        });
        this.setSession({
          token: response.token,
          refreshToken: response.refreshToken,
          user: response.user,
        });
        return response;
      } finally {
        this.loading = false;
      }
    },
    async refreshSession() {
      if (!this.refreshToken) {
        return null;
      }

      const response = await apiFetch("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: this.refreshToken }),
        skipAuthRefresh: true,
      });

      this.setSession({
        token: response.token,
        refreshToken: response.refreshToken,
        user: response.user || this.user,
      });

      return response;
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
        if (error.status === 401 || error.status === 403) {
          this.clearSession();
        }
        throw error;
      }
    },
    async bootstrapSession() {
      this.attachSessionMaintenance();

      if (!this.token && this.refreshToken) {
        try {
          await this.refreshSession();
        } catch (error) {
          if (error.status === 401 || error.status === 403) {
            this.clearSession();
          }
          return null;
        }
      }

      if (this.token && !this.user) {
        try {
          await this.fetchProfile();
        } catch (error) {
          if (this.refreshToken) {
            try {
              await this.refreshSession();
              await this.fetchProfile();
            } catch (refreshError) {
              if (refreshError.status === 401 || refreshError.status === 403) {
                this.clearSession();
              }
              return null;
            }
          }
        }
      }

      if (this.refreshToken) {
        this.scheduleRefresh();
      }

      return this.user;
    },
    async logout() {
      try {
        if (this.refreshToken) {
          await apiFetch("/auth/logout", {
            method: "POST",
            body: JSON.stringify({ refreshToken: this.refreshToken }),
            skipAuthRefresh: true,
          });
        }
      } catch (error) {
        // Ignore logout API failures on the client.
      }

      this.clearSession();
    },
  },
});
