<script setup>
import { computed } from "vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

const navItems = computed(() =>
  authStore.isAuthenticated
    ? [
        { label: "Home", icon: "/mobile-nav/home.png", to: "/" },
        { label: "Dashboard", icon: "/mobile-nav/dashboard.png", to: "/dashboard" },
        { label: "Tickets", icon: "/mobile-nav/card.png", to: "/tickets" },
        { label: "Historique", icon: "/mobile-nav/historique.png", to: "/history" },
      ]
    : [
        { label: "Home", icon: "/mobile-nav/home.png", to: "/" },
        { label: "Connexion", icon: "/mobile-nav/enter.png", to: "/auth" },
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
      <img class="mobile-nav-icon-image" :src="item.icon" :alt="item.label" />
      <span class="mobile-nav-label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>
