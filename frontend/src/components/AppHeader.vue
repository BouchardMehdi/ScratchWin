<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const navLinks = computed(() =>
  authStore.isAuthenticated
    ? [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Tickets", to: "/tickets" },
        { label: "Historique", to: "/history" },
      ]
    : [],
);

async function logout() {
  await authStore.logout();
  router.push("/");
}
</script>

<template>
  <header class="topbar">
    <RouterLink to="/" class="brand">
      <img
        src="/branding/scratchwin-logo.png"
        alt="ScratchWin"
        class="brand-logo"
      />
      <div>
        <strong>ScratchWin</strong>
        <p>Tickets a gratter en Vue + Express</p>
      </div>
    </RouterLink>

    <nav v-if="navLinks.length" class="topbar-nav">
      <RouterLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="nav-link"
      >
        {{ link.label }}
      </RouterLink>
    </nav>

    <div class="topbar-actions">
      <div v-if="authStore.user" class="credits-pill">
        {{ authStore.user.credits.toFixed(2) }} credits
      </div>
      <RouterLink v-if="!authStore.isAuthenticated" to="/auth" class="button button-primary">
        Connexion
      </RouterLink>
      <button v-else type="button" class="button button-muted" @click="logout">
        Deconnexion
      </button>
    </div>
  </header>
</template>
