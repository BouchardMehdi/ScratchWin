<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import RevealGrid from "../components/RevealGrid.vue";
import SymbolToken from "../components/SymbolToken.vue";
import { getTicketUi } from "../data/ticketRules";
import { useGamesStore } from "../stores/games";
import { useTicketsStore } from "../stores/tickets";

const route = useRoute();
const gamesStore = useGamesStore();
const ticketsStore = useTicketsStore();
const errorMessage = ref("");

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
  await ticketsStore.fetchTickets();
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
    <div v-if="ticket" class="scratch-layout">
      <div class="scratch-sidebar">
        <p class="eyebrow">Ticket selectionne</p>
        <h1>{{ ticket.name }}</h1>
        <p>{{ ticket.description }}</p>

        <dl class="ticket-stats">
          <div>
            <dt>Prix</dt>
            <dd>{{ ticket.price.toFixed(2) }} credits</dd>
          </div>
          <div>
            <dt>Gain max</dt>
            <dd>{{ ticket.maxReward.toFixed(2) }} credits</dd>
          </div>
          <div>
            <dt>Probabilite</dt>
            <dd>{{ ticket.winProbability }}%</dd>
          </div>
        </dl>

        <div v-if="ticketUi" class="ticket-rule-box scratch-rule-box">
          <p class="eyebrow">Comment gagner</p>
          <p class="ticket-rule-text">{{ ticketUi.winRule }}</p>
          <div class="symbol-row">
            <SymbolToken
              v-for="symbol in ticketUi.symbols"
              :key="symbol"
              :symbol="symbol"
              size="small"
            />
          </div>
        </div>

        <button type="button" class="button button-primary" :disabled="gamesStore.playing" @click="play">
          {{ gamesStore.playing ? "Generation..." : "Acheter et gratter" }}
        </button>

        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
      </div>

      <div class="scratch-main">
        <RevealGrid
          v-if="gamesStore.currentGame?.game?.ticketId === ticket.id"
          :result-data="gamesStore.currentGame.game.resultData"
        />
        <div v-else class="placeholder-panel">
          <strong>Le ticket n'est pas encore achete.</strong>
          <p>Achete un ticket, puis gratte les cases pour reveler les symboles.</p>
        </div>
      </div>
    </div>
  </section>
</template>
