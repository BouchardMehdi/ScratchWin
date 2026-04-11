<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const features = [
  "Inscription et connexion JWT",
  "5 tickets avec mecaniques distinctes",
  "Solde de credits mis a jour en direct",
  "Historique des parties cote utilisateur",
];

const deferredInstallPrompt = ref(null);
const installMessage = ref("");
const isStandalone = ref(false);

const canInstall = computed(() => Boolean(deferredInstallPrompt.value) && !isStandalone.value);

function detectStandaloneMode() {
  isStandalone.value =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function handleBeforeInstallPrompt(event) {
  event.preventDefault();
  deferredInstallPrompt.value = event;
  installMessage.value = "";
}

function handleAppInstalled() {
  deferredInstallPrompt.value = null;
  isStandalone.value = true;
  installMessage.value = "L'application est installee sur cet appareil.";
}

async function installApp() {
  if (!deferredInstallPrompt.value) {
    installMessage.value =
      "Sur certains navigateurs, l'installation se fait depuis le menu du navigateur.";
    return;
  }

  deferredInstallPrompt.value.prompt();
  const choice = await deferredInstallPrompt.value.userChoice;

  if (choice.outcome === "accepted") {
    installMessage.value = "Installation lancee.";
  }

  deferredInstallPrompt.value = null;
}

onMounted(() => {
  detectStandaloneMode();
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.removeEventListener("appinstalled", handleAppInstalled);
});
</script>

<template>
  <section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">Projet portfolio friendly</p>
      <h1>Une petite webapp full-stack de tickets a gratter, simple et propre.</h1>
      <p class="hero-text">
        Projet realise avec Node.js, Express, Vue 3, Vue Router, Pinia, MySQL et une
        configuration PWA installable.
      </p>
      <div class="hero-actions">
        <RouterLink to="/auth" class="button button-primary">Commencer</RouterLink>
        <button
          v-if="!isStandalone"
          type="button"
          class="button button-primary"
          @click="installApp"
        >
          {{ canInstall ? "Telecharger l'app" : "Installer sur mobile" }}
        </button>
        <a href="#features" class="button button-muted">Voir le MVP</a>
      </div>
      <p v-if="installMessage" class="install-note">{{ installMessage }}</p>
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
