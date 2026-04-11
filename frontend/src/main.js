import { createApp } from "vue";
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
authStore.bootstrapSession().catch(() => {});

app.mount("#app");

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
