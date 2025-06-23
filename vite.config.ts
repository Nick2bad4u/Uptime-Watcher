import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import path from "path";
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    base: './', // Ensures relative asset paths for Electron
    plugins: [
        react(),
        electron([
            {
                entry: "electron/main.ts",
                onstart(options) {
                    options.startup();
                },
                vite: {
                    build: {
                        outDir: "dist-electron",
                    },
                },
            },
            {
                entry: "electron/preload.ts",
                onstart(options) {
                    options.reload();
                },
                vite: {
                    build: {
                        outDir: "dist-electron",
                    },
                },
            },
        ]),
        viteStaticCopy({
            targets: [
                {
                    src: 'node_modules/node-sqlite3-wasm/dist/node-sqlite3-wasm.wasm',
                    dest: '' // Copies to dist/
                },
                {
                    src: 'node_modules/node-sqlite3-wasm/dist/node-sqlite3-wasm.wasm',
                    dest: '../dist-electron' // Copies to dist-electron/
                }
            ]
        })
    ],
    server: {
        port: 5173,
        strictPort: true, // Fail if port is taken (prevents silent port changes)
        open: false, // Don't auto-open browser (Electron only)
    },
    build: {
        outDir: 'dist',
        sourcemap: true, // Recommended for Electron debugging
        emptyOutDir: true, // Clean output before build
        target: 'esnext', // Modern output for Electron
        rollupOptions: {
            output: {
                manualChunks: undefined // Avoids code splitting for Electron main/preload
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
});
