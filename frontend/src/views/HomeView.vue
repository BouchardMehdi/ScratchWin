<script setup>
const features = [
  "Inscription et connexion JWT",
  "5 tickets avec mecaniques distinctes",
  "Solde de credits mis a jour en direct",
  "Historique des parties cote utilisateur",
];
</script>

<template>
  <section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">Projet portfolio friendly</p>
      <h1>Une petite webapp full-stack de tickets a gratter, simple et propre.</h1>
      <p class="hero-text">
        ScratchWin est pense comme un MVP pedagogique pour apprendre Express, Vue 3, Pinia,
        Vue Router et MySQL sans tomber dans l'overengineering.
      </p>
      <div class="hero-actions">
        <RouterLink to="/auth" class="button button-primary">Commencer</RouterLink>
        <a href="#features" class="button button-muted">Voir le MVP</a>
      </div>
    </div>

    <div class="hero-card">
      <p class="eyebrow">Le parcours utilisateur</p>
      <ol class="hero-steps">
        <li>Creer un compte</li>
        <li>Choisir un ticket</li>
        <li>Acheter puis reveler les cases</li>
        <li>Voir le gain et l'historique</li>
      </ol>
    </div>
  </section>

  <section id="features" class="section-block">
    <div class="section-heading">
      <p class="eyebrow">MVP</p>
      <h2>Ce que le projet couvre deja</h2>
    </div>

    <div class="feature-grid">
      <article v-for="feature in features" :key="feature" class="feature-card">
        {{ feature }}
      </article>
    </div>
  </section>
</template>

