<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "./stores/auth";
import AppHeader from "./components/AppHeader.vue";
import MobileNav from "./components/MobileNav.vue";

const authStore = useAuthStore();

onMounted(() => {
  if (authStore.token && !authStore.user) {
    authStore.fetchProfile().catch(() => {});
  }
});
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <main class="page-wrap">
      <RouterView />
    </main>
    <MobileNav />
  </div>
</template>
