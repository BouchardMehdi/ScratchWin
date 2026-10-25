<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import RevealGrid from "../components/RevealGrid.vue";
import SymbolToken from "../components/SymbolToken.vue";
import LotteryTicket from "../components/LotteryTicket.vue";
import { getTicketUi } from "../data/ticketRules";
import { useGamesStore } from "../stores/games";
import { useTicketsStore } from "../stores/tickets";

const route = useRoute();
const gamesStore = useGamesStore();
const ticketsStore = useTicketsStore();
const errorMessage = ref("");
const loading = ref(true);

const ticket = computed(() => ticketsStore.byId(route.params.id));
const ticketUi = computed(() => (ticket.value ? getTicketUi(ticket.value.slug) : null));

watch(
  () => route.params.id,
  () => {
    gamesStore.clearCurrentGame();
    errorMessage.value = "";
  },
);

onMounted(async () => {
  try {
    await ticketsStore.fetchTickets();
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
});

async function play() {
  errorMessage.value = "";

  try {
    await gamesStore.playTicket(Number(route.params.id));
  } catch (error) {
    errorMessage.value = error.message;
  }
}
</script>

<template>
  <section class="section-block">
    <RouterLink to="/tickets" class="ticket-back-link"><span aria-hidden="true">←</span> Tous les tickets</RouterLink>
    <p v-if="loading" class="empty-state" role="status">Chargement du ticket...</p>
    <p v-else-if="!ticket" class="form-error" role="alert">{{ errorMessage || "Ce ticket est introuvable." }}</p>
    <div v-else class="ticket-play-layout">
      <div class="scratch-sidebar">
        <p class="eyebrow">{{ ticketUi.collection }}</p>
        <h1>{{ ticket.name }}</h1>
        <p class="ticket-play-description">{{ ticketUi.tagline }} Achète ton ticket, puis passe le doigt ou la souris sur les zones à gratter.</p>

        <dl class="ticket-play-stats">
          <div>
            <dt>Prix</dt>
            <dd>{{ ticket.price.toLocaleString('fr-FR') }} <small>crédits</small></dd>
          </div>
          <div>
            <dt>Gain maximum</dt>
            <dd>{{ ticket.maxReward.toLocaleString('fr-FR') }} <small>crédits</small></dd>
          </div>
        </dl>
        <button type="button" class="button ticket-buy-button" :disabled="gamesStore.playing" @click="play">
          <span>{{ gamesStore.playing ? "Préparation du ticket…" : gamesStore.currentGame?.game?.ticketId === ticket.id ? "Acheter un nouveau ticket" : "Acheter et gratter" }}</span>
          <span aria-hidden="true">↗</span>
        </button>
        <p class="ticket-play-note">{{ ticket.winProbability }} % de tickets gagnants · Jeu en crédits virtuels.</p>
        <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
        <div v-if="ticketUi" class="ticket-play-rules">
          <h2>Comment gagner ?</h2>
          <p>{{ ticketUi.winRule }}</p>
          <div class="symbol-row">
            <SymbolToken
              v-for="symbol in ticketUi.symbols"
              :key="symbol"
              :symbol="symbol"
              size="small"
            />
          </div>
        </div>

      </div>

      <div class="scratch-main">
        <RevealGrid
          v-if="gamesStore.currentGame?.game?.ticketId === ticket.id"
          :result-data="gamesStore.currentGame.game.resultData"
          :ticket="ticket"
          :game-id="gamesStore.currentGame.game.id"
        />
        <template v-else>
          <div class="ticket-sealed-label">
            <span><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" /><path d="M5 7V4a3 3 0 0 1 6 0v3" stroke="currentColor" /></svg> Ticket non acheté</span>
            <span>Aperçu</span>
          </div>
          <LotteryTicket :ticket="ticket" />
        </template>
      </div>
    </div>
  </section>
</template>
