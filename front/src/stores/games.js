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
  }),
  actions: {
    clearCurrentGame() {
      this.currentGame = null;
    },
    async playTicket(ticketId) {
      this.playing = true;
      this.currentGame = null;

      try {
        const response = await apiFetch("/games/play", {
          method: "POST",
          body: JSON.stringify({ ticketId }),
        });

        this.currentGame = response;
        this.history = [response.game, ...this.history].slice(0, 50);

        const authStore = useAuthStore(pinia);
        authStore.user = response.user;

        return response;
      } finally {
        this.playing = false;
      }
    },
    async fetchHistory(filters = {}) {
      this.loadingHistory = true;

      try {
        const params = new URLSearchParams();

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
        this.history = response.games;
        return response.games;
      } finally {
        this.loadingHistory = false;
      }
    },
  },
});
