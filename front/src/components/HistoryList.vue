<script setup>
defineProps({
  games: {
    type: Array,
    required: true,
  },
});

function formatDate(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
</script>

<template>
  <div class="history-list">
    <article v-for="game in games" :key="game.id" class="history-item">
      <div>
        <p class="eyebrow">{{ formatDate(game.playedAt) }}</p>
        <h3>{{ game.ticketName }}</h3>
        <p>{{ game.resultData?.summary || "Partie jouee" }}</p>
      </div>

      <div class="history-values">
        <span class="status-badge" :class="{ win: game.isWin, loss: !game.isWin }">
          {{ game.isWin ? "Gagne" : "Perdu" }}
        </span>
        <strong>{{ game.reward.toFixed(2) }} credits</strong>
        <small>Cout: {{ game.cost.toFixed(2) }}</small>
      </div>
    </article>

    <p v-if="games.length === 0" class="empty-state">
      Aucune partie pour le moment.
    </p>
  </div>
</template>

