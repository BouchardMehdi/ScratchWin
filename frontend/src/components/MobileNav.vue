<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const navItems = computed(() =>
  authStore.isAuthenticated
    ? [
        { label: "Dashboard", icon: "/mobile-nav/dashboard.png", to: "/dashboard" },
        { label: "Tickets", icon: "/mobile-nav/card.png", to: "/tickets" },
        { label: "Historique", icon: "/mobile-nav/historique.png", to: "/history" },
        { label: "Logout", icon: "/mobile-nav/logout.png", action: "logout" },
      ]
    : [
        { label: "Connexion", icon: "/mobile-nav/enter.png", to: "/auth" },
      ],
);

async function handleAction(item) {
  if (item.action === "logout") {
    await authStore.logout();
    router.push("/");
  }
}
</script>

<template>
  <nav class="mobile-nav">
    <RouterLink
      v-for="item in navItems.filter((entry) => entry.to)"
      :key="item.to"
      :to="item.to"
      class="mobile-nav-link"
    >
      <img class="mobile-nav-icon-image" :src="item.icon" :alt="item.label" />
      <span class="mobile-nav-label">{{ item.label }}</span>
    </RouterLink>

    <button
      v-for="item in navItems.filter((entry) => entry.action)"
      :key="item.action"
      type="button"
      class="mobile-nav-link mobile-nav-button"
      @click="handleAction(item)"
    >
      <img class="mobile-nav-icon-image" :src="item.icon" :alt="item.label" />
      <span class="mobile-nav-label">{{ item.label }}</span>
    </button>
  </nav>
</template>
