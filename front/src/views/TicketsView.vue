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
  <section class="section-block">
    <div class="section-heading">
      <p class="eyebrow">Catalogue</p>
      <h1>Choisis ton ticket a gratter</h1>
      <p>Chaque ticket affiche maintenant sa regle de gain, ses symboles et son style de revelation.</p>
    </div>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
    <p v-else-if="ticketsStore.loading" class="empty-state">Chargement des tickets...</p>

    <div v-else class="ticket-grid">
      <TicketCard v-for="ticket in ticketsStore.items" :key="ticket.id" :ticket="ticket" />
    </div>
  </section>
</template>
