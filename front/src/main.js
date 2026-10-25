import { createApp, watch } from "vue";
import App from "./App.vue";
import router from "./router";
import { pinia } from "./stores/pinia";
import { useAuthStore } from "./stores/auth";
import { useThemeStore } from "./stores/theme";
import "./assets/main.css";

const app = createApp(App);

app.use(pinia);
app.use(router);

const themeStore = useThemeStore(pinia);
const authStore = useAuthStore(pinia);

themeStore.initTheme();
watch(() => authStore.isAuthenticated, (authenticated) => {
  if (!authenticated && router.currentRoute.value.meta.requiresAuth) router.replace("/auth");
});

async function mountApp() {
  await authStore.bootstrapSession().catch(() => {});
  await router.isReady();
  if (!authStore.isAuthenticated && router.currentRoute.value.meta.requiresAuth) {
    await router.replace("/auth");
  }
  app.mount("#app");
}
mountApp();

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}
