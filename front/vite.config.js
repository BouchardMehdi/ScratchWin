import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const basePath = env.VITE_APP_BASE_PATH || "/scratchwin/";
  const apiBasePath = env.VITE_API_BASE_URL || "/scratchwin/api";
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || "http://localhost:3000";

  return {
    base: basePath,
    plugins: [vue()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      proxy: {
        [apiBasePath]: {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/scratchwin/, ""),
        },
      },
    },
  };
});
