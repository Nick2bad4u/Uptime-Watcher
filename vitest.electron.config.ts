import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// Your overriding test config
const myTestConfig = {
    clearMocks: true,
    coverage: {
        include: [
            "electron/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
            "shared/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
        ],
        reportsDirectory: "./coverage/electron",
    },
    environment: "node",
    exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/dist-electron/**",
        "**/src/**",
        "**/coverage/**",
        "**/shared/**",
    ],
    include: [
        "electron/**/**.test.ts",
        "electron/**/**.spec.ts",
    ],
    outputFile: {
        json: "./coverage/electron/test-results.json",
    },
    restoreMocks: true,
    setupFiles: ["./electron/test/setup.ts"],
};

export default defineConfig((configEnv) => {
    // Merge base configs
    const merged = mergeConfig(viteConfig(configEnv), defineConfig({}));

    // Smart merge for test config
    merged.test = {
        ...merged.test, // preserve fields from extended config
        ...myTestConfig, // override only those you define
        coverage: {
            ...merged.test?.coverage, // preserve base coverage fields
            ...myTestConfig.coverage, // override only those you define
        },
    };

    return merged;
});
