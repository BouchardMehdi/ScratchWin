<script setup>
import { computed, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useTicketsStore } from "../stores/tickets";

const authStore = useAuthStore();
const ticketsStore = useTicketsStore();

const featuredTickets = computed(() => ticketsStore.items.slice(0, 3));
const ticketCount = computed(() => ticketsStore.items.length);
const cheapestTicket = computed(() => {
  if (!ticketsStore.items.length) {
    return null;
  }

  return [...ticketsStore.items].sort((left, right) => left.price - right.price)[0];
});
const topReward = computed(() => {
  if (!ticketsStore.items.length) {
    return 0;
  }

  return Math.max(...ticketsStore.items.map((ticket) => ticket.maxReward));
});

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
        <span class="stat-label">Solde actuel</span>
        <strong>{{ authStore.credits.toFixed(2) }} credits</strong>
        <p class="stat-subtitle">Ton compte est pret pour une nouvelle session de grattage.</p>
        <div class="stat-meta">
          <div>
            <small>Tickets</small>
            <b>{{ ticketCount }}</b>
          </div>
          <div>
            <small>Entree min</small>
            <b>{{ cheapestTicket ? `${cheapestTicket.price.toFixed(2)} cr` : "--" }}</b>
          </div>
          <div>
            <small>Gain max</small>
            <b>{{ topReward.toFixed(2) }} cr</b>
          </div>
        </div>
      </div>
    </div>

    <div class="quick-grid dashboard-quick-grid">
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
