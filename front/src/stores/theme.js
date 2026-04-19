import { defineStore } from "pinia";

const THEME_KEY = "scratchwin_theme";

function resolveInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const useThemeStore = defineStore("theme", {
  state: () => ({
    theme: "light",
  }),
  actions: {
    applyTheme(theme) {
      this.theme = theme;
      localStorage.setItem(THEME_KEY, theme);
      document.documentElement.dataset.theme = theme;
    },
    initTheme() {
      this.applyTheme(resolveInitialTheme());
    },
    toggleTheme() {
      this.applyTheme(this.theme === "dark" ? "light" : "dark");
    },
  },
});
