import { resolve } from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    cors: {
      origin: "https://www.owlbear.rodeo",
    },
  },
build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        "popover-content": resolve(__dirname, "popover-content.html"),
      },
    },
  },
});