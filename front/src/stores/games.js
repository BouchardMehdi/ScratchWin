import { defineStore } from "pinia";
import { apiFetch } from "../api/http";
import { useAuthStore } from "./auth";
import { pinia } from "./pinia";

export const useGamesStore = defineStore("games", {
  state: () => ({
    currentGame: null,
    history: [],
    loadingHistory: false,
    playing: false,
    pagination: { page: 1, pageSize: 20, hasMore: false },
    requestVersion: 0,
    historyRequest: 0,
  }),
  actions: {
    resetSession() {
      this.requestVersion += 1;
      this.historyRequest += 1;
      this.currentGame = null;
      this.history = [];
      this.loadingHistory = false;
      this.playing = false;
      this.pagination = { page: 1, pageSize: 20, hasMore: false };
    },
    clearCurrentGame() {
      this.currentGame = null;
    },
    async playTicket(ticketId) {
      if (this.playing) return;
      const version = this.requestVersion;
      this.playing = true;
      this.currentGame = null;

      try {
        const response = await apiFetch("/games/play", {
          method: "POST",
          body: JSON.stringify({ ticketId }),
        });

        if (version !== this.requestVersion) return null;
        this.currentGame = response;
        this.history = [response.game, ...this.history].slice(0, 50);

        const authStore = useAuthStore(pinia);
        authStore.user = response.user;

        return response;
      } finally {
        if (version === this.requestVersion) this.playing = false;
      }
    },
    async fetchHistory(filters = {}) {
      const version = this.requestVersion;
      const request = ++this.historyRequest;
      this.loadingHistory = true;

      try {
        const params = new URLSearchParams();
        params.set("page", filters.page || 1);
        params.set("pageSize", 20);

        if (filters.ticketId) {
          params.set("ticketId", filters.ticketId);
        }

        if (filters.result && filters.result !== "all") {
          params.set("result", filters.result);
        } else if (filters.result === "all") {
          params.set("result", "all");
        }

        const suffix = params.toString() ? `?${params.toString()}` : "";
        const response = await apiFetch(`/games/history${suffix}`);
        if (version !== this.requestVersion || request !== this.historyRequest) return [];
        this.history = response.games;
        this.pagination = response.pagination;
        return response.games;
      } finally {
        if (version === this.requestVersion && request === this.historyRequest) this.loadingHistory = false;
      }
    },
  },
});
