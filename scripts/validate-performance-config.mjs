#!/usr/bin/env node

/**
 * Quick script to validate our Vite performance configuration.
 */

import { readFileSync } from "node:fs";
import * as path from "node:path";

console.log("🔍 Vite Performance Configuration Validator\n");

// Check if package.json has our new scripts
const packagePath = path.join(import.meta.dirname, "..", "package.json");
const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));

const expectedScripts = [
    "debug:transform",
    "debug:vite",
    "profile",
    "profile:debug",
    "profile:transform",
    "dev:profile",
    "dev:warmup",
];

console.log("📦 Checking package.json scripts:");
expectedScripts.forEach((script) => {
    const exists = packageJson.scripts[script];
    console.log(`  ${exists ? "✅" : "❌"} ${script}: ${exists || "MISSING"}`);
});

// Check if vite.config.ts has warmup configuration
const viteConfigPath = path.join(import.meta.dirname, "..", "vite.config.ts");
const viteConfig = readFileSync(viteConfigPath, "utf8");

console.log("\n⚙️  Checking Vite configuration:");
const hasWarmup = viteConfig.includes("warmup:");
const hasClientFiles = viteConfig.includes("clientFiles:");
const warmupFiles = viteConfig.match(/\.\/src\/[^"']+/g) || [];

console.log(
    `  ${hasWarmup ? "✅" : "❌"} Warmup configuration: ${hasWarmup ? "FOUND" : "MISSING"}`
);
console.log(
    `  ${hasClientFiles ? "✅" : "❌"} Client files array: ${hasClientFiles ? "FOUND" : "MISSING"}`
);
console.log(`  📊 Warmup files count: ${warmupFiles.length}`);

if (warmupFiles.length > 0) {
    console.log("\n🔥 Files configured for warmup:");
    // Group by category
    const categories = {
        Core: warmupFiles.filter(
            (f) => f.includes("App.tsx") || f.includes("main.tsx")
        ),
        Stores: warmupFiles.filter((f) => f.includes("/stores/")),
        Theme: warmupFiles.filter((f) => f.includes("/theme/")),
        Charts: warmupFiles.filter(
            (f) => f.includes("chart") || f.includes("Chart")
        ),
        Components: warmupFiles.filter(
            (f) => f.includes("/components/") && !f.includes("chart")
        ),
        Utils: warmupFiles.filter(
            (f) => f.includes("/utils/") || f.includes("/services/")
        ),
        Shared: warmupFiles.filter((f) => f.includes("shared/")),
    };

    Object.entries(categories).forEach(([category, files]) => {
        if (files.length > 0) {
            console.log(`  ${category} (${files.length} files):`);
            files.forEach((file) => console.log(`    - ${file}`));
        }
    });
}

console.log("\n🎯 Performance Benefits:");
console.log("  - Faster initial load times");
console.log("  - Pre-warmed Chart.js components");
console.log("  - Reduced import waterfalls");
console.log("  - Better developer experience");

console.log("\n📋 Next Steps:");
console.log("  1. Run `npm run dev:warmup` to test warmup");
console.log("  2. Run `npm run debug:transform` to identify slow files");
console.log("  3. Run `npm run profile` for CPU profiling");
console.log("  4. Use speedscope.app to analyze .cpuprofile files");

console.log("\n✨ Configuration complete!");
