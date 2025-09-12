#!/usr/bin/env ts-node

/**
 * Script to add comprehensive annotations to Playwright tests.
 *
 * This script automatically adds tags and annotations to existing Playwright
 * tests to improve test organization, categorization, and execution control.
 *
 * Annotation Categories:
 *
 * - @fast: Tests that complete quickly (< 5 seconds)
 * - @slow: Tests that take longer to complete (> 5 seconds)
 * - @ui: User interface and visual tests
 * - @e2e: End-to-end integration tests
 * - @smoke: Critical functionality smoke tests
 * - @core: Essential application core functionality
 * - @api: API and interface testing
 * - @main: Electron main process tests
 * - @renderer: Electron renderer process tests
 * - @interaction: User interaction testing
 * - @performance: Performance and timing tests
 * - @metadata: Application metadata and configuration
 * - @system: System integration and environment tests
 * - @react: React framework specific tests
 * - @dev: Development tools and debugging tests
 * - @critical: Business critical functionality
 * - @issue: Known issues or failing tests
 */

import fs from "node:fs";
import path from "node:path";

interface TestAnnotation {
    type: string;
    description: string;
}

interface TestConfig {
    testName: string;
    tags: string[];
    annotations: TestAnnotation[];
}

/**
 * Configuration for test annotations based on test patterns and content
 */
const testConfigurations: Record<string, TestConfig[]> = {
    "app-launch.e2e.playwright.test.ts": [
        {
            testName: "should launch the app successfully",
            tags: ["@fast", "@critical"],
            annotations: [
                { type: "issue", description: "Core functionality test" },
                {
                    type: "performance",
                    description: "App startup time critical",
                },
            ],
        },
        {
            testName: "should create a main window",
            tags: ["@fast", "@ui"],
            annotations: [
                {
                    type: "ui",
                    description: "Verifies main window creation and properties",
                },
                {
                    type: "performance",
                    description: "Window creation timing critical",
                },
            ],
        },
        {
            testName: "should have correct app metadata",
            tags: ["@slow", "@metadata"],
            annotations: [
                {
                    type: "metadata",
                    description:
                        "Verifies application metadata and version info",
                },
                {
                    type: "issue",
                    description: "Known failing test - metadata access issues",
                },
            ],
        },
        {
            testName: "should handle app ready state correctly",
            tags: ["@fast", "@core"],
            annotations: [
                {
                    type: "core",
                    description: "Verifies app initialization and ready state",
                },
                {
                    type: "performance",
                    description: "App ready state timing verification",
                },
            ],
        },
    ],
    "main-process.main.playwright.test.ts": [
        {
            testName: "should access main process APIs",
            tags: ["@fast", "@api"],
            annotations: [
                {
                    type: "api",
                    description:
                        "Verifies main process API access and functionality",
                },
                {
                    type: "core",
                    description: "Essential main process operations",
                },
            ],
        },
        {
            testName: "should handle window management",
            tags: ["@slow", "@ui"],
            annotations: [
                {
                    type: "ui",
                    description: "Window management and bounds testing",
                },
                {
                    type: "issue",
                    description:
                        "Known failing test - window resize and bounds issues",
                },
            ],
        },
        {
            testName: "should handle app events properly",
            tags: ["@fast", "@core"],
            annotations: [
                {
                    type: "core",
                    description: "App event handling and state management",
                },
                {
                    type: "api",
                    description: "Electron app API functionality verification",
                },
            ],
        },
        {
            testName: "should access system information",
            tags: ["@slow", "@system"],
            annotations: [
                {
                    type: "system",
                    description: "System information and environment testing",
                },
                {
                    type: "api",
                    description: "Electron system API access verification",
                },
            ],
        },
    ],
    "renderer-process.renderer.playwright.test.ts": [
        {
            testName: "should load the main UI correctly",
            tags: [
                "@fast",
                "@ui",
                "@smoke",
            ],
            annotations: [
                {
                    type: "ui",
                    description:
                        "Main UI loading and basic content verification",
                },
                {
                    type: "smoke",
                    description: "Critical UI functionality smoke test",
                },
            ],
        },
        {
            testName: "should have proper React hydration",
            tags: ["@fast", "@react"],
            annotations: [
                {
                    type: "react",
                    description:
                        "React framework hydration and mounting verification",
                },
                {
                    type: "ui",
                    description: "Frontend framework initialization test",
                },
            ],
        },
        {
            testName: "should handle basic user interactions",
            tags: [
                "@slow",
                "@ui",
                "@interaction",
            ],
            annotations: [
                {
                    type: "interaction",
                    description: "Basic UI element interaction testing",
                },
                {
                    type: "ui",
                    description: "User interface responsiveness verification",
                },
            ],
        },
        {
            testName: "should handle window resize",
            tags: ["@slow", "@ui"],
            annotations: [
                {
                    type: "ui",
                    description: "Window resize behavior and UI adaptation",
                },
                {
                    type: "issue",
                    description: "Known failing test - window resize issues",
                },
            ],
        },
        {
            testName: "should handle dev tools (if enabled)",
            tags: ["@slow", "@dev"],
            annotations: [
                {
                    type: "dev",
                    description: "Development tools access and functionality",
                },
                {
                    type: "api",
                    description: "Electron dev tools API verification",
                },
            ],
        },
    ],
};

/**
 * Formats test annotations for insertion into test files
 */
function formatTestAnnotations(config: TestConfig): string {
    const tagString = config.tags.map((tag) => `"${tag}"`).join(", ");

    let annotationString = "";
    if (config.annotations.length === 1) {
        const ann = config.annotations[0];
        annotationString = `{ type: "${ann.type}", description: "${ann.description}" }`;
    } else if (config.annotations.length > 1) {
        const annStrings = config.annotations.map(
            (ann) =>
                `            { type: "${ann.type}", description: "${ann.description}" }`
        );
        annotationString = `[\n${annStrings.join(",\n")}\n        ]`;
    }

    return `{
        tag: [${tagString}],
        annotation: ${annotationString}
    }`;
}

/**
 * Adds annotations to a test file
 */
function addAnnotationsToFile(filePath: string, configs: TestConfig[]): void {
    console.log(`Processing file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, "utf-8");

    for (const config of configs) {
        const testPattern = new RegExp(
            `test\\("${config.testName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\s*,\\s*async\\s*\\(\\)\\s*=>`,
            "g"
        );

        const replacement = `test("${config.testName}", ${formatTestAnnotations(config)}, async () =>`;

        if (testPattern.test(content)) {
            content = content.replace(testPattern, replacement);
            console.log(`  ✓ Added annotations to: ${config.testName}`);
        } else {
            console.log(`  ⚠ Pattern not found for: ${config.testName}`);
        }
    }

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`  ✓ File updated: ${filePath}`);
}

/**
 * Main execution function
 */
function main(): void {
    console.log("🎭 Adding Playwright Test Annotations\n");

    const testDir = path.join(process.cwd(), "playwright", "tests");

    for (const [fileName, configs] of Object.entries(testConfigurations)) {
        const filePath = path.join(testDir, fileName);
        addAnnotationsToFile(filePath, configs);
        console.log();
    }

    console.log("✅ Annotation script completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Run: npm run playwright --list to verify annotations");
    console.log('2. Run: npm run playwright --grep="@fast" to test fast tests');
    console.log(
        '3. Run: npm run playwright --grep="@smoke" to test critical functionality'
    );
}

// Execute if run directly
if (require.main === module) {
    main();
}

export { main, addAnnotationsToFile, formatTestAnnotations };
