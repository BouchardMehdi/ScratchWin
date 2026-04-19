<script setup>
import AppHeader from "./components/AppHeader.vue";
import MobileNav from "./components/MobileNav.vue";
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
