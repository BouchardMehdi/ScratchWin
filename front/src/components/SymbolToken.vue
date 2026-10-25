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

const names = { bolt: "Éclair", coin: "Pièce", star: "Étoile", spark: "Étincelle", gem: "Gemme", diamond: "Diamant", crown: "Couronne", key: "Clé", clover: "Trèfle", bell: "Cloche", cherry: "Cerises", seven: "Sept", question: "Mystère", moon: "Lune" };
const ariaLabel = computed(() => props.label || names[props.symbol] || "Symbole");
</script>

<template>
  <span
    class="symbol-token"
    :class="[`symbol-${props.size}`, `symbol-${props.symbol}`]"
    role="img"
    :aria-label="ariaLabel"
  >
    <svg class="symbol-illustration" viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
      <g v-if="symbol === 'bolt'" stroke="#9e6c1b" stroke-width="2" stroke-linejoin="round">
        <path d="M37 5 12 35h18l-4 24 26-34H34Z" fill="#ffc63d" /><path d="m34 12-15 20h17l-5 16 15-20H30Z" fill="#fff09b" stroke="none" />
      </g>
      <g v-else-if="symbol === 'coin'" stroke="#a37321" stroke-width="2">
        <circle cx="32" cy="32" r="25" fill="#f0ba4b" /><circle cx="32" cy="32" r="19" fill="#ffdc79" /><path d="m32 20 3 8 9 1-7 6 2 9-7-5-7 5 2-9-7-6 9-1Z" fill="#d69b34" stroke="none" />
      </g>
      <g v-else-if="symbol === 'crown'" stroke="#9e6c1b" stroke-width="2" stroke-linejoin="round">
        <path d="m8 19 14 10L32 12l10 17 14-10-7 29H15Z" fill="#f4c65a" /><path d="M17 52h30" stroke-width="5" stroke-linecap="round" /><path d="m32 29 5 6-5 6-5-6Z" fill="#21846a" /><circle cx="8" cy="17" r="3" fill="#ffeaa2" /><circle cx="32" cy="10" r="3" fill="#ffeaa2" /><circle cx="56" cy="17" r="3" fill="#ffeaa2" />
      </g>
      <g v-else-if="symbol === 'gem' || symbol === 'diamond'" stroke="#386c8c" stroke-width="2" stroke-linejoin="round">
        <path d="M14 13h36l10 15-28 30L4 28Z" fill="#83d0e1" /><path d="m14 13 7 15 11-15 11 15 7-15M4 28h56M21 28l11 30 11-30" /><path d="m32 13 11 15H21Z" fill="#daf6ed" />
      </g>
      <g v-else-if="symbol === 'clover'" stroke="#226346" stroke-width="2">
        <path d="M31 29C9 26 12 5 25 9c5 2 7 7 7 9 0-2 2-7 7-9 13-4 16 17-6 20 3-22 24-19 20-6-2 5-7 7-9 7 2 0 7 2 9 7 4 13-17 16-20-6 22 3 19 24 6 20-5-2-7-7-7-9 0 2-2 7-7 9-13 4-16-17 6-20-3 22-24 19-20 6 2-5 7-7 9-7-2 0-7-2-9-7-4-13 17-16 20 6Z" fill="#4caa70" /><path d="M32 32c-1 14 4 21 10 26" stroke-width="4" stroke-linecap="round" />
      </g>
      <g v-else-if="symbol === 'bell'" stroke="#9e6c1b" stroke-width="2" stroke-linejoin="round">
        <path d="M12 47c6-7 5-14 5-20a15 15 0 0 1 30 0c0 6-1 13 5 20Z" fill="#edbb4c" /><path d="M12 47h40v5H12Z" fill="#ffdc81" /><path d="M27 55a5 5 0 0 0 10 0" fill="#d29a31" /><path d="M28 10V7h8v3" /><path d="M25 23c-4 4-3 9-4 15" stroke="#fff0b8" stroke-width="4" stroke-linecap="round" />
      </g>
      <g v-else-if="symbol === 'cherry'" stroke-width="2">
        <path d="M20 39c10-7 9-24 20-31m3 33c-1-14 0-22-3-33" stroke="#336744" stroke-width="3" /><path d="M39 9c8-4 17 1 20 7-8 3-16 0-20-7Z" fill="#519766" stroke="#336744" /><circle cx="19" cy="44" r="12" fill="#df5a57" stroke="#a6343d" /><circle cx="44" cy="45" r="12" fill="#c9434e" stroke="#a6343d" /><path d="m14 39 3-2m21 2 3-2" stroke="#ffc0a7" stroke-width="4" stroke-linecap="round" />
      </g>
      <g v-else-if="symbol === 'key'" stroke="#a67b34" stroke-width="3" stroke-linejoin="round">
        <circle cx="23" cy="22" r="14" fill="#e9c371" /><circle cx="23" cy="22" r="5" fill="#fff9e9" /><path d="m32 32 20 20 5-5-6-6 4-4-6-6-4 4-6-6Z" fill="#e9c371" />
      </g>
      <g v-else-if="symbol === 'moon'" stroke="#a38b4e" stroke-width="2">
        <path d="M42 7a25 25 0 1 0 13 37A24 24 0 0 1 42 7Z" fill="#efd28a" /><path d="m48 12 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#c9b4dc" stroke="none" />
      </g>
      <g v-else-if="symbol === 'seven'">
        <path d="M14 10h40L32 57H16l20-34H14Z" fill="#bd382e" stroke="#7d2d26" stroke-width="2" stroke-linejoin="round" /><path d="M19 15h27L26 52h-3l19-33H19Z" fill="#f78b5a" />
      </g>
      <g v-else-if="symbol === 'question'" stroke="#635083" stroke-linecap="round">
        <path d="M19 20c0-18 30-18 30-1 0 13-17 12-17 24" stroke-width="9" /><circle cx="32" cy="55" r="5" fill="#635083" stroke="none" /><path d="M22 17c4-8 14-8 18-4" stroke="#c1a6da" stroke-width="2" />
      </g>
      <path v-else-if="symbol === 'star'" d="m32 5 8 17 19 3-14 14 3 19-16-9-17 9 4-19L5 25l19-3Z" fill="#f3c55b" stroke="#b58b3a" stroke-width="2" stroke-linejoin="round" />
      <path v-else d="m32 4 7 21 21 7-21 7-7 21-7-21-21-7 21-7Z" fill="#e2bc69" stroke="#a78140" stroke-width="2" stroke-linejoin="round" />
    </svg>
  </span>
</template>

