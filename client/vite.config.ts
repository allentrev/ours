import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "url";

export default defineConfig({
    server: {
        proxy: {
            "/api": "http://localhost:4000",
        },
        host: true, // listen on all network interfaces
        port: 5173, // optional, default is 5173
        allowedHosts: ["all"],
    },
    resolve: {
        alias: {
            assets: fileURLToPath(new URL("./src/assets", import.meta.url)),
            components: fileURLToPath(new URL("./src/components", import.meta.url)),
            layouts: fileURLToPath(new URL("./src/layouts", import.meta.url)),
            pages: fileURLToPath(new URL("./src/pages", import.meta.url)),
            utilities: fileURLToPath(new URL("./src/utilities", import.meta.url)),
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    plugins: [react(), tailwindcss()],
});
