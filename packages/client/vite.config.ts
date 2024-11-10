import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@wl-image-canvas/types": path.resolve(__dirname, "../types/src"),
        },
    },
    build: {
        commonjsOptions: {
            include: [/@wl-image-canvas\/types/, /node_modules/],
        },
    },
    server: {
        proxy:
            mode === "development"
                ? {
                      "/api": {
                          target: "http://localhost:3000",
                          changeOrigin: true,
                          secure: false,
                      },
                  }
                : undefined,
    },
}));
