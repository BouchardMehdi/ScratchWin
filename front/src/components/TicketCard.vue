<script setup>
import { computed } from "vue";
import SymbolToken from "./SymbolToken.vue";
import { getTicketUi } from "../data/ticketRules";

const props = defineProps({
  ticket: {
    type: Object,
    required: true,
  },
});

const themes = {
  flash: "ticket-flash",
  fortune: "ticket-fortune",
  jackpot: "ticket-jackpot",
  mystere: "ticket-mystere",
  "lucky-7": "ticket-lucky",
};

const ticketUi = computed(() => getTicketUi(props.ticket.slug));
</script>

<template>
  <article class="ticket-card" :class="themes[props.ticket.slug]">
    <div class="ticket-card-top">
      <div>
        <p class="eyebrow">{{ props.ticket.ticketType }}</p>
        <h3>{{ props.ticket.name }}</h3>
      </div>
      <span class="price-badge">{{ props.ticket.price.toFixed(2) }} credits</span>
    </div>

    <p class="ticket-description">{{ props.ticket.description }}</p>

    <dl class="ticket-stats">
      <div>
        <dt>Gain max</dt>
        <dd>{{ props.ticket.maxReward.toFixed(2) }}</dd>
      </div>
      <div>
        <dt>Probabilite</dt>
        <dd>{{ props.ticket.winProbability }}%</dd>
      </div>
    </dl>

    <div class="ticket-rule-box">
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

    <ul class="reward-list">
      <li v-for="reward in props.ticket.rewards" :key="reward.id">
        <span>{{ reward.label }}</span>
        <strong>{{ reward.amount.toFixed(2) }}</strong>
      </li>
    </ul>

    <RouterLink :to="`/tickets/${props.ticket.id}/play`" class="button button-primary">
      Jouer ce ticket
    </RouterLink>
  </article>
</template>
