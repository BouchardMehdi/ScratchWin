<script setup>
import { computed, ref, watch } from "vue";
import ScratchCell from "./ScratchCell.vue";
import { playJackpotSound, playLossSound, playWinSound } from "../utils/audio";

const props = defineProps({
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
  <section class="scratch-panel">
    <div class="scratch-heading">
      <div>
        <p class="eyebrow">Ticket actif</p>
        <h2>{{ props.resultData.headline }}</h2>
      </div>
      <button type="button" class="button button-muted" @click="revealAll">
        Tout reveler
      </button>
    </div>

    <div
      class="reveal-grid"
      :style="{ gridTemplateColumns: `repeat(${props.resultData.columns}, minmax(0, 1fr))` }"
    >
      <ScratchCell
        v-for="cell in props.resultData.cells"
        :key="cell.id"
        :cell="cell"
        :round-token="roundToken"
        :force-reveal-token="forceRevealToken"
        @revealed="revealCell"
      />
    </div>

    <div v-if="allRevealed" class="result-banner" :class="{ win: props.resultData.rewardAmount > 0 }">
      <strong>{{ props.resultData.rewardLabel }}</strong>
      <p>{{ props.resultData.summary }}</p>
    </div>
  </section>
</template>
