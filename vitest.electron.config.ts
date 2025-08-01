import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// Your overriding test config
const myTestConfig = {
    clearMocks: true,
    coverage: {
        exclude: [
            "**/*.config.*",
            "**/*.d.ts",
            "**/dist/**", // Exclude any dist folder anywhere
            "**/docs/**",
            "**/docs/**", // Exclude documentation files
            "**/index.ts", // Exclude all barrel export files
            "**/index.tsx", // Exclude JSX barrel export files
            "**/node_modules/**",
            "**/types.ts", // Exclude type definition files
            "**/types.tsx", // Exclude type definition files with JSX
            "coverage/**",
            "dist-electron/**",
            "dist/**",
            "src/**", // Exclude all src files from electron coverage
            "index.ts", // Barrel export file at root
            "release/**",
            "scripts/**",
            "report/**", // Exclude report files
            "**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,css}",
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
    merged["test"] = {
        ...merged["test"], // preserve fields from extended config
        ...myTestConfig, // override only those you define
        coverage: {
            ...merged["test"]?.coverage, // preserve base coverage fields
            ...myTestConfig.coverage, // override only those you define
        },
    };

    return merged;
});
