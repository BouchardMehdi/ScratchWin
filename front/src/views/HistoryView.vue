<script setup>
import { onMounted, reactive, ref } from "vue";
import HistoryList from "../components/HistoryList.vue";
import { useGamesStore } from "../stores/games";
import { useTicketsStore } from "../stores/tickets";

const gamesStore = useGamesStore();
const ticketsStore = useTicketsStore();
const errorMessage = ref("");

const filters = reactive({
  ticketId: "",
  result: "all",
});

async function loadHistory() {
  errorMessage.value = "";

  try {
    await gamesStore.fetchHistory(filters);
  } catch (error) {
    errorMessage.value = error.message;
  }
}

onMounted(async () => {
  await ticketsStore.fetchTickets();
  await loadHistory();
});
</script>

<template>
  <section class="section-block">
    <div class="section-heading">
      <p class="eyebrow">Historique</p>
      <h1>Toutes les parties de l'utilisateur</h1>
    </div>

    <form class="filter-bar" @submit.prevent="loadHistory">
      <label>
        Ticket
        <select v-model="filters.ticketId">
          <option value="">Tous</option>
          <option v-for="ticket in ticketsStore.items" :key="ticket.id" :value="ticket.id">
            {{ ticket.name }}
          </option>
        </select>
      </label>

      <label>
        Resultat
        <select v-model="filters.result">
          <option value="all">Tous</option>
          <option value="win">Gagnes</option>
          <option value="loss">Perdus</option>
        </select>
      </label>

      <button type="submit" class="button button-primary">Filtrer</button>
    </form>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
    <p v-else-if="gamesStore.loadingHistory" class="empty-state">Chargement de l'historique...</p>
    <HistoryList v-else :games="gamesStore.history" />
  </section>
</template>
