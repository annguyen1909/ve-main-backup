import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { vercelPreset } from "@vercel/remix/vite";
import fullReload from "vite-plugin-full-reload";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

const isVercel = process.env.VERCEL === "1";

export default defineConfig({
  plugins: [
    remix({
      ...(isVercel && { presets: [vercelPreset()] }),
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: false,
      },
    }),
    tsconfigPaths(),
    fullReload([
      "app/routes/**", // reload when route files change
      "app/root.tsx", // reload on root changes
      "app/**/*.server.ts", // or any server-only files you edit
      "app/tailwind.css", // reload on tailwind changes
    ]),
  ],
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
  build: {
    target: "esnext",
  },
});
