#!/usr/bin/env node

/**
 * Verifies that all ESLint inspector components are properly deployed.
 *
 * @version 1.0.0
 *
 * @file Verification script for ESLint Config Inspector deployment.
 *
 * @author Uptime-Watcher Team
 *
 * @since 1.0.0
 */

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

const rootDir = path.resolve("./");
const docusaurusDir = path.join(rootDir, "docs", "docusaurus");
const staticDir = path.join(docusaurusDir, "static", "eslint-inspector");
const buildDir = path.join(docusaurusDir, "build", "eslint-inspector");
const expectedInspectorFiles = [
    "index.html",
    "200.html",
    "404.html",
    "favicon.svg",
];
const expectedInspectorHref =
    "https://nick2bad4u.github.io/Uptime-Watcher/eslint-inspector/";
const expectedInspectorLabel = "ESLint Config";

/**
 * Checks if a directory exists and contains expected files.
 *
 * @param {string} dirPath - Directory path to check.
 * @param {string[]} expectedFiles - Expected files in directory.
 *
 * @returns {Promise<{ exists: boolean; files: string[]; missing: string[] }>}
 */
async function checkDirectory(dirPath, expectedFiles = []) {
    try {
        const stats = await fs.stat(dirPath);
        if (!stats.isDirectory()) {
            return { exists: false, files: [], missing: expectedFiles };
        }

        const files = await fs.readdir(dirPath);
        const missing = expectedFiles.filter((file) => !files.includes(file));

        return {
            exists: true,
            files,
            missing,
        };
    } catch {
        return { exists: false, files: [], missing: expectedFiles };
    }
}

/**
 * Verifies configuration file contents.
 *
 * @param {string} filePath - Path to config file.
 *
 * @returns {Promise<{ valid: boolean; content?: string; error?: string }>}
 */
async function verifyConfigFile(filePath) {
    try {
        const content = await fs.readFile(filePath, "utf8");

        // Check for ESLint Inspector link in navbar
        if (filePath.includes("docusaurus.config.ts")) {
            const hasEslintLink =
                content.includes(expectedInspectorLabel) &&
                content.includes(expectedInspectorHref);
            return {
                valid: hasEslintLink,
                content: hasEslintLink
                    ? "ESLint inspector navbar link found"
                    : "ESLint inspector navbar link missing",
            };
        }

        // Check for build script in package.json
        if (filePath.includes("package.json")) {
            const hasEslintScript = content.includes("build:eslint-inspector");
            return {
                valid: hasEslintScript,
                content: hasEslintScript
                    ? "ESLint inspector build script found"
                    : "ESLint inspector build script missing",
            };
        }

        return { valid: true, content: "File exists and is readable" };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

/**
 * Main verification function.
 *
 * @returns {Promise<boolean>} True when every verification passes.
 */
async function verifyESLintInspectorDeployment() {
    console.log("🔍 Verifying ESLint Config Inspector deployment...\n");

    let allChecksPassed = true;
    const checkResults = [];

    const staticCheck = await checkDirectory(staticDir, expectedInspectorFiles);

    console.log("📁 Static Directory Check:");
    if (staticCheck.exists) {
        console.log(`   ✅ Directory exists: ${staticDir}`);
        console.log(`   ✅ Files found: ${staticCheck.files.length}`);
        if (staticCheck.missing.length === 0) {
            console.log("   ✅ All expected files present");
            checkResults.push({ name: "Static Directory", passed: true });
        } else {
            console.log(
                `   ❌ Missing files: ${staticCheck.missing.join(", ")}`
            );
            allChecksPassed = false;
            checkResults.push({ name: "Static Directory", passed: false });
        }
    } else {
        console.log(`   ❌ Directory missing: ${staticDir}`);
        allChecksPassed = false;
        checkResults.push({ name: "Static Directory", passed: false });
    }

    const buildCheck = await checkDirectory(buildDir, expectedInspectorFiles);

    console.log("\n🏗️  Build Directory Check:");
    if (buildCheck.exists) {
        console.log(`   ✅ Directory exists: ${buildDir}`);
        console.log(`   ✅ Files found: ${buildCheck.files.length}`);
        if (buildCheck.missing.length === 0) {
            console.log("   ✅ All expected files present");
            checkResults.push({ name: "Build Directory", passed: true });
        } else {
            console.log(
                `   ❌ Missing files: ${buildCheck.missing.join(", ")}`
            );
            allChecksPassed = false;
            checkResults.push({ name: "Build Directory", passed: false });
        }
    } else {
        console.log(`   ❌ Directory missing: ${buildDir}`);
        console.log('   ℹ️  Run "npm run build" in docusaurus directory first');
        allChecksPassed = false;
        checkResults.push({ name: "Build Directory", passed: false });
    }

    // Configuration file checks
    const configFiles = [
        path.join(docusaurusDir, "docusaurus.config.ts"),
        path.join(rootDir, "package.json"),
    ];

    console.log("\n⚙️  Configuration Files Check:");
    for (const configFile of configFiles) {
        const configCheck = await verifyConfigFile(configFile);
        const fileName = configFile.split(/[/\\]/).pop() || "unknown";

        if (configCheck.valid) {
            console.log(`   ✅ ${fileName}: ${configCheck.content}`);
            checkResults.push({ name: fileName, passed: true });
        } else {
            console.log(
                `   ❌ ${fileName}: ${configCheck.error || configCheck.content}`
            );
            allChecksPassed = false;
            checkResults.push({ name: fileName, passed: false });
        }
    }

    // Build script verification
    console.log("\n🔨 Build Script Check:");
    try {
        const buildScriptPath = path.join(
            rootDir,
            "scripts",
            "build-eslint-inspector.mjs"
        );
        await fs.access(buildScriptPath);
        console.log(`   ✅ Build script exists: ${buildScriptPath}`);
        checkResults.push({ name: "Build Script", passed: true });
    } catch (error) {
        console.log(
            `   ❌ Build script missing: ${error instanceof Error ? error.message : String(error)}`
        );
        allChecksPassed = false;
        checkResults.push({ name: "Build Script", passed: false });
    }

    // Summary
    console.log("\n📊 Summary:");
    const passedChecks = checkResults.filter((check) => check.passed).length;
    const totalChecks = checkResults.length;

    console.log(`   Checks passed: ${passedChecks}/${totalChecks}`);

    if (allChecksPassed) {
        console.log(
            "\n🎉 All verifications passed! ESLint Config Inspector is ready for deployment."
        );
        console.log("\n📝 Next steps:");
        console.log("   1. Commit and push changes to GitHub");
        console.log("   2. ESLint Config Inspector will be available at:");
        console.log(
            "      https://nick2bad4u.github.io/Uptime-Watcher/eslint-inspector/"
        );
        console.log(
            '   3. Access via navbar "ESLint Config" link in documentation'
        );
    } else {
        console.log(
            "\n❌ Some verifications failed. Please address the issues above before deployment."
        );
        return false;
    }

    return true;
}

/**
 * Check whether this module is being run as the CLI entrypoint.
 *
 * @returns {boolean} True when invoked directly.
 */
function isDirectRun() {
    return (
        typeof process.argv[1] === "string" &&
        import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
    );
}

if (isDirectRun()) {
    try {
        process.exitCode = (await verifyESLintInspectorDeployment()) ? 0 : 1;
    } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
    }
}
