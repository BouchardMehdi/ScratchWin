<script setup>
import { computed, ref, watch } from "vue";
import ScratchCell from "./ScratchCell.vue";
import LotteryTicket from "./LotteryTicket.vue";
import { getTicketUi } from "../data/ticketRules";
import { playJackpotSound, playLossSound, playWinSound } from "../utils/audio";

const props = defineProps({
  ticket: { type: Object, required: true },
  gameId: { type: [Number, String], default: null },
  resultData: {
    type: Object,
    required: true,
  },
});

const revealedIds = ref(new Set());
const forceRevealToken = ref(0);
const roundToken = ref(0);
const playedOutcomeRound = ref(-1);

watch(
  () => props.resultData,
  () => {
    revealedIds.value = new Set();
    roundToken.value += 1;
    playedOutcomeRound.value = -1;
  },
  { immediate: true },
);

const allRevealed = computed(
  () => props.resultData.cells.length > 0 && revealedIds.value.size === props.resultData.cells.length,
);

function revealCell(id) {
  revealedIds.value = new Set([...revealedIds.value, id]);
}

function revealAll() {
  revealedIds.value = new Set(props.resultData.cells.map((cell) => cell.id));
  forceRevealToken.value += 1;
}

watch(allRevealed, (isComplete) => {
  if (!isComplete || playedOutcomeRound.value === roundToken.value) {
    return;
  }

  if (props.resultData.isJackpot) {
    playJackpotSound();
  } else if (props.resultData.rewardAmount > 0) {
    playWinSound();
  } else {
    playLossSound();
  }

  playedOutcomeRound.value = roundToken.value;
});
</script>

<template>
  <section class="scratch-session">
    <div class="scratch-session-toolbar">
      <span aria-live="polite">{{ revealedIds.size }} / {{ resultData.cells.length }} cases révélées</span>
      <button type="button" :disabled="allRevealed" @click="revealAll">
        Tout révéler
      </button>
    </div>
    <LotteryTicket :ticket="ticket" :serial="gameId">
      <div
        class="reveal-grid"
        :style="{ gridTemplateColumns: `repeat(${props.resultData.columns}, minmax(0, 1fr))` }"
      >
        <ScratchCell
          v-for="cell in props.resultData.cells"
          :key="cell.id"
          :cell="cell"
          :round-token="roundToken"
          :foil-tone="getTicketUi(ticket.slug).foil"
          :force-reveal-token="forceRevealToken"
          @revealed="revealCell"
        />
      </div>
    </LotteryTicket>
    <div v-if="allRevealed" class="result-banner" :class="{ win: props.resultData.rewardAmount > 0 }" role="status" aria-live="polite">
      <strong>{{ props.resultData.rewardLabel }}</strong>
      <p>{{ props.resultData.summary }}</p>
    </div>
  </section>
</template>
