<script setup>
import { computed, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useTicketsStore } from "../stores/tickets";

const authStore = useAuthStore();
const ticketsStore = useTicketsStore();

const featuredTickets = computed(() => ticketsStore.items.slice(0, 3));

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchProfile();
  }

  await ticketsStore.fetchTickets();
});
</script>

<template>
  <section class="section-block">
    <div class="dashboard-hero">
      <div>
        <p class="eyebrow">Dashboard</p>
        <h1>Bonjour {{ authStore.user?.username }}</h1>
        <p>Ton espace central pour voir ton solde, jouer et suivre tes parties.</p>
      </div>
      <div class="stat-highlight">
        <span>Solde actuel</span>
        <strong>{{ authStore.credits.toFixed(2) }} credits</strong>
      </div>
    </div>

    <div class="quick-grid">
      <RouterLink to="/tickets" class="quick-card">
        <strong>Voir les tickets</strong>
        <p>Choisir parmi 5 tickets differents.</p>
      </RouterLink>
      <RouterLink to="/history" class="quick-card">
        <strong>Historique</strong>
        <p>Retrouver tes gains et tes pertes.</p>
      </RouterLink>
      <article class="quick-card">
        <strong>Session active</strong>
        <p>Le profil et le solde sont recharges automatiquement via JWT.</p>
      </article>
    </div>
  </section>

  <section class="section-block">
    <div class="section-heading">
      <p class="eyebrow">Tickets</p>
      <h2>Commencer rapidement</h2>
    </div>

    <div class="ticket-grid compact">
      <RouterLink
        v-for="ticket in featuredTickets"
        :key="ticket.id"
        :to="`/tickets/${ticket.id}/play`"
        class="quick-card"
      >
        <strong>{{ ticket.name }}</strong>
        <p>{{ ticket.price.toFixed(2) }} credits</p>
      </RouterLink>
    </div>
  </section>
</template>
