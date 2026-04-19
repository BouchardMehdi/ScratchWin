import { defineStore } from "pinia";
import { apiFetch } from "../api/http";

export const useTicketsStore = defineStore("tickets", {
  state: () => ({
    items: [],
    loading: false,
  }),
  getters: {
    byId: (state) => (ticketId) => state.items.find((ticket) => ticket.id === Number(ticketId)),
  },
  actions: {
    async fetchTickets(force = false) {
      if (this.items.length && !force) {
        return this.items;
      }

      this.loading = true;
      try {
        const response = await apiFetch("/tickets");
        this.items = response.tickets;
        return this.items;
      } finally {
        this.loading = false;
      }
    },
  },
});

