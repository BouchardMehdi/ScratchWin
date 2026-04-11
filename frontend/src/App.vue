<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "./stores/auth";
import { useThemeStore } from "./stores/theme";
import { pinia } from "./stores/pinia";
import AppHeader from "./components/AppHeader.vue";
import MobileNav from "./components/MobileNav.vue";

const authStore = useAuthStore(pinia);
const themeStore = useThemeStore(pinia);
themeStore.initTheme();

onMounted(() => {
  authStore.bootstrapSession().catch(() => {});
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
