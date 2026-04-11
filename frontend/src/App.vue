<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "./stores/auth";
import { useThemeStore } from "./stores/theme";
import AppHeader from "./components/AppHeader.vue";
import MobileNav from "./components/MobileNav.vue";

const authStore = useAuthStore();
const themeStore = useThemeStore();
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
