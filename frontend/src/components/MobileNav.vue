<script setup>
import { computed } from "vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

const navItems = computed(() =>
  authStore.isAuthenticated
    ? [
        { label: "Accueil", icon: "🏠", to: "/dashboard" },
        { label: "Tickets", icon: "🎟", to: "/tickets" },
        { label: "Historique", icon: "🕘", to: "/history" },
      ]
    : [
        { label: "Accueil", icon: "🏠", to: "/" },
        { label: "Connexion", icon: "🔐", to: "/auth" },
      ],
);
</script>

<template>
  <nav class="mobile-nav">
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="mobile-nav-link"
    >
      <span class="mobile-nav-icon" aria-hidden="true">{{ item.icon }}</span>
      <span class="mobile-nav-label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>
