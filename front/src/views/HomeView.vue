<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const features = [
  "Inscription et connexion JWT",
  "5 tickets avec mecaniques distinctes",
  "Solde de credits mis a jour en direct",
  "Historique des parties cote utilisateur",
];

const INSTALL_POPUP_DISMISSED_KEY = "scratchwin_install_popup_dismissed_at";
const INSTALL_POPUP_DELAY_MS = 1200;
const INSTALL_POPUP_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const deferredInstallPrompt = ref(null);
const installMessage = ref("");
const isStandalone = ref(false);
const showInstallPopup = ref(false);

const canInstall = computed(() => Boolean(deferredInstallPrompt.value) && !isStandalone.value);
const installPopupTitle = computed(() =>
  canInstall.value ? "Installe ScratchWin sur ton appareil" : "Ajoute ScratchWin a ton ecran d'accueil",
);
const installPopupText = computed(() => {
  if (canInstall.value) {
    return "Profite d'un acces rapide, d'une experience plein ecran et d'une webapp plus proche d'une vraie app mobile.";
  }

  if (/iphone|ipad|ipod/i.test(window.navigator.userAgent)) {
    return "Sur iPhone et iPad, utilise le bouton Partager puis choisis Sur l'ecran d'accueil pour installer l'application.";
  }

  return "Selon le navigateur, l'installation passe parfois par le menu du navigateur. Cherche l'option Installer l'application ou Ajouter a l'ecran d'accueil.";
});

function detectStandaloneMode() {
  isStandalone.value =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function shouldShowInstallPopup() {
  if (isStandalone.value) {
    return false;
  }

  const dismissedAt = Number(localStorage.getItem(INSTALL_POPUP_DISMISSED_KEY) || 0);
  return Date.now() - dismissedAt > INSTALL_POPUP_COOLDOWN_MS;
}

function openInstallPopup() {
  if (shouldShowInstallPopup()) {
    showInstallPopup.value = true;
  }
}

function closeInstallPopup(persistDismissal = true) {
  showInstallPopup.value = false;

  if (persistDismissal) {
    localStorage.setItem(INSTALL_POPUP_DISMISSED_KEY, String(Date.now()));
  }
}

function handleBeforeInstallPrompt(event) {
  event.preventDefault();
  deferredInstallPrompt.value = event;
  installMessage.value = "";
  openInstallPopup();
}

function handleAppInstalled() {
  deferredInstallPrompt.value = null;
  isStandalone.value = true;
  showInstallPopup.value = false;
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
    showInstallPopup.value = false;
  } else {
    installMessage.value = "Installation annulee pour le moment.";
  }

  deferredInstallPrompt.value = null;
}

onMounted(() => {
  detectStandaloneMode();
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);

  window.setTimeout(() => {
    openInstallPopup();
  }, INSTALL_POPUP_DELAY_MS);
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

  <div v-if="showInstallPopup" class="install-popup-backdrop" @click.self="closeInstallPopup()">
    <div class="install-popup">
      <p class="eyebrow">Application</p>
      <h3>{{ installPopupTitle }}</h3>
      <p class="install-popup-text">{{ installPopupText }}</p>

      <div class="install-popup-actions">
        <button type="button" class="button button-primary" @click="installApp">
          {{ canInstall ? "Installer maintenant" : "Voir comment l'installer" }}
        </button>
        <button type="button" class="button button-muted" @click="closeInstallPopup()">
          Plus tard
        </button>
      </div>
    </div>
  </div>
</template>
