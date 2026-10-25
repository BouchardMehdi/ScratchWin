<script setup>
import { onMounted, ref } from "vue";
import TicketCard from "../components/TicketCard.vue";
import { useTicketsStore } from "../stores/tickets";

const ticketsStore = useTicketsStore();
const errorMessage = ref("");

onMounted(async () => {
  try {
    await ticketsStore.fetchTickets();
  } catch (error) {
    errorMessage.value = error.message;
  }
});
</script>

<template>
  <section class="section-block ticket-catalogue">
    <div class="catalogue-heading">
      <div>
        <p class="eyebrow">La collection ScratchWin</p>
        <h1>La chance, au bout des doigts.</h1>
        <p>Cinq univers, un même frisson. Choisis ton ticket, gratte les cases et découvre ce que la chance te réserve.</p>
      </div>
      <span v-if="ticketsStore.items.length" class="catalogue-count">{{ ticketsStore.items.length }} tickets à découvrir</span>
    </div>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
    <p v-else-if="ticketsStore.loading" class="empty-state">Chargement des tickets...</p>

    <div v-else class="ticket-grid">
      <TicketCard v-for="ticket in ticketsStore.items" :key="ticket.id" :ticket="ticket" />
    </div>
  </section>
</template>
