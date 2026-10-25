<script setup>
import { computed } from "vue";
import LotteryTicket from "./LotteryTicket.vue";
import { getTicketUi } from "../data/ticketRules";

const props = defineProps({
  ticket: {
    type: Object,
    required: true,
  },
});

const ticketUi = computed(() => getTicketUi(props.ticket.slug));
</script>

<template>
  <article class="ticket-card">
    <RouterLink :to="`/tickets/${ticket.id}/play`" class="ticket-preview-link" :aria-label="`Découvrir le ticket ${ticket.name}`">
      <LotteryTicket :ticket="ticket" compact />
    </RouterLink>
    <div class="ticket-card-caption">
      <p>{{ ticketUi.tagline }}</p>
      <span>{{ ticket.winProbability }} % de tickets gagnants</span>
    </div>
    <RouterLink :to="`/tickets/${ticket.id}/play`" class="ticket-pick-button">
      <span>Choisir ce ticket <small>· {{ ticket.price.toLocaleString('fr-FR') }} crédits</small></span>
      <span aria-hidden="true">↗</span>
    </RouterLink>
    <details class="ticket-details">
      <summary>Règles et lots possibles</summary>
      <p>{{ ticketUi.winRule }}</p>
      <ul class="ticket-prize-list">
        <li v-for="reward in ticket.rewards" :key="reward.id"><span>{{ reward.label }}</span><b>{{ reward.amount.toLocaleString('fr-FR') }} cr.</b></li>
      </ul>
    </details>
  </article>
</template>
