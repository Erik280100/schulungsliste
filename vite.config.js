import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Auf GitHub Pages liegt die App unter /schulungsliste/
export default defineConfig({ base: "/schulungsliste/", plugins: [react()] });
