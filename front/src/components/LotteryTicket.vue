<script setup>
import { computed } from "vue";
import TicketArtwork from "./TicketArtwork.vue";
import { getTicketUi } from "../data/ticketRules";

const props = defineProps({
  ticket: { type: Object, required: true },
  serial: { type: [Number, String], default: null },
  compact: { type: Boolean, default: false },
});
const ui = computed(() => getTicketUi(props.ticket.slug));
const cellCount = computed(() => props.ticket.slug === "lucky-7" ? 9 : 6);
const printedNumber = computed(() => props.serial
  ? `N° ${String(props.serial).padStart(8, "0")}`
  : `COLLECTION · ${String(props.ticket.id).padStart(2, "0")}`);
const number = (value) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value);
</script>

<template>
  <div class="lottery-ticket" :class="[`lottery-${ticket.slug}`, { 'lottery-ticket--compact': compact }]">
    <div class="ticket-print-band">
      <span class="ticket-print-brand"><b>SW</b> SCRATCHWIN</span>
      <span class="ticket-denomination">{{ number(ticket.price) }} <small>CRÉDITS</small></span>
    </div>
    <div class="ticket-hero">
      <div class="ticket-guilloche" aria-hidden="true" />
      <p class="ticket-collection">{{ ui.collection }}</p>
      <component :is="compact ? 'h3' : 'h2'" class="ticket-display-title">{{ ui.title }}</component>
      <TicketArtwork :slug="ticket.slug" />
      <div class="ticket-prize"><span>JUSQU'À</span><strong>{{ number(ticket.maxReward) }}</strong><span>CRÉDITS À GAGNER</span></div>
      <span class="ticket-edition" aria-hidden="true">ÉDITION<br />ORIGINALE</span>
    </div>
    <div class="ticket-game-area">
      <div class="ticket-zone-heading"><span>{{ cellCount }} CASES À GRATTER</span><span aria-hidden="true">✦</span></div>
      <slot>
        <div class="ticket-preview-grid" :class="{ 'ticket-preview-grid--nine': cellCount === 9 }" aria-hidden="true">
          <div v-for="cell in cellCount" :key="cell" class="ticket-preview-cell" :class="`foil-${ui.foil}`">
            <span class="foil-monogram">SW</span><small>{{ String(cell).padStart(2, "0") }}</small>
          </div>
        </div>
        <p class="ticket-preview-note">Le résultat sera révélé après l'achat.</p>
      </slot>
      <p class="ticket-printed-rule">{{ ui.shortRule }}</p>
    </div>
    <div class="ticket-stub">
      <span class="ticket-barcode" aria-hidden="true" />
      <div><span>{{ printedNumber }}</span><small>JEU DÉMO · CRÉDITS VIRTUELS</small></div>
      <span class="ticket-stub-mark" aria-hidden="true">SW</span>
    </div>
  </div>
</template>
