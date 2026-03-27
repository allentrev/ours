import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

// Convert ESM meta URL to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
            assets: path.resolve(__dirname, "src/assets"),
            components: path.resolve(__dirname, "src/components"),
            layouts: path.resolve(__dirname, "src/layouts"),
            pages: path.resolve(__dirname, "src/pages"),
            utilities: path.resolve(__dirname, "src/utilities"),
            '@': path.resolve(__dirname, './src'),
        },
    },
    plugins: [react(), tailwindcss()],
});
