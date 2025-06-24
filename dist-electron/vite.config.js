"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
// eslint-disable-next-line perfectionist/sort-imports
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const vite_1 = require("vite");
const vite_plugin_electron_1 = __importDefault(require("vite-plugin-electron"));
const vite_plugin_static_copy_1 = require("vite-plugin-static-copy");
exports.default = (0, vite_1.defineConfig)({
    base: "./", // Ensures relative asset paths for Electron
    build: {
        emptyOutDir: true, // Clean output before build
        outDir: "dist",
        rollupOptions: {
            output: {
                manualChunks: undefined, // Avoids code splitting for Electron main/preload
            },
        },
        sourcemap: true, // Recommended for Electron debugging
        target: "esnext", // Modern output for Electron
    },
    plugins: [
        (0, plugin_react_1.default)(),
        (0, vite_plugin_electron_1.default)([
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
        (0, vite_plugin_static_copy_1.viteStaticCopy)({
            targets: [
                // Remove copy to dist/ (frontend) - only needed in dist-electron/
                {
                    dest: "../dist-electron", // Copies to dist-electron/
                    src: "node_modules/node-sqlite3-wasm/dist/node-sqlite3-wasm.wasm",
                },
            ],
        }),
    ],
    resolve: {
        alias: {
            "@": path_1.default.resolve(__dirname, "src"),
        },
    },
    server: {
        open: false, // Don't auto-open browser (Electron only)
        port: 5173,
        strictPort: true, // Fail if port is taken (prevents silent port changes)
    },
});
