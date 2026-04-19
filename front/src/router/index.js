import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AuthView from "../views/AuthView.vue";
import DashboardView from "../views/DashboardView.vue";
import TicketsView from "../views/TicketsView.vue";
import ScratchView from "../views/ScratchView.vue";
import HistoryView from "../views/HistoryView.vue";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../api/http";

const routes = [
  { path: "/", name: "home", component: HomeView },
  { path: "/auth", name: "auth", component: AuthView, meta: { guestOnly: true } },
  { path: "/dashboard", name: "dashboard", component: DashboardView, meta: { requiresAuth: true } },
  { path: "/tickets", name: "tickets", component: TicketsView, meta: { requiresAuth: true } },
  {
    path: "/tickets/:id/play",
    name: "scratch",
    component: ScratchView,
    meta: { requiresAuth: true },
  },
  { path: "/history", name: "history", component: HistoryView, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const hasSession = Boolean(token || refreshToken);

  if (to.meta.requiresAuth && !hasSession) {
    return { name: "auth" };
  }

  if (to.meta.guestOnly && hasSession) {
    return { name: "dashboard" };
  }

  return true;
});

export default router;
