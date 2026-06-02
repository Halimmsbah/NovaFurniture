import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const DEFAULT_API_BASE_URL = "http://localhost:3000/api/v1";
const DEFAULT_BACKEND_ORIGIN = "http://localhost:3000";

function backendOrigin(apiBaseURL: string | undefined) {
  if (!apiBaseURL) return DEFAULT_BACKEND_ORIGIN;

  try {
    return new URL(apiBaseURL).origin;
  } catch {
    return DEFAULT_BACKEND_ORIGIN;
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBaseURL = env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

  return {
    plugins: [
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      tsConfigPaths(),
      tanstackStart({
        server: { entry: "server" },
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
      dedupe: ["@tanstack/react-router", "react", "react-dom"],
    },
    server: {
      proxy: {
        "/api/v1": {
          target: backendOrigin(apiBaseURL),
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
