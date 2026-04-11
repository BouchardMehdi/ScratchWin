<script setup>
import { computed } from "vue";

const props = defineProps({
  symbol: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: "medium",
  },
  label: {
    type: String,
    default: "",
  },
});

const iconMap = {
  bolt: "⚡",
  coin: "🪙",
  star: "★",
  spark: "✦",
  gem: "💎",
  diamond: "♦",
  crown: "♛",
  key: "🗝",
  clover: "🍀",
  bell: "🔔",
  cherry: "🍒",
  seven: "7",
  question: "?",
  moon: "☾",
};

const icon = computed(() => iconMap[props.symbol] || "✦");
const ariaLabel = computed(() => props.label || props.symbol);
</script>

<template>
  <span
    class="symbol-token"
    :class="[`symbol-${props.size}`, `symbol-${props.symbol}`]"
    role="img"
    :aria-label="ariaLabel"
  >
    {{ icon }}
  </span>
</template>

