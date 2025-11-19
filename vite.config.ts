import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/dentist-customer-manager/",
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
