import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // '@' -> 'src' folder
    },
  },
  test: {
    globals: true,         // use global test APIs like describe, it, expect
    environment: "node",   // node test environment (good for backend / execSync)
    include: ["test/*.test.ts"], // where to find tests
  },
});