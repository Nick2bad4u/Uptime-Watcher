#!/usr/bin/env node

/**
 * @fileoverview Build script for ESLint Config Inspector
 *
 * This script builds a static version of the ESLint Config Inspector
 * and copies it to the Docusaurus static directory for deployment.
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import fs from 'fs-extra';

// Configuration - using process.cwd() since we'll run from project root
const PROJECT_ROOT = process.cwd();
const DOCUSAURUS_STATIC_DIR = path.join(PROJECT_ROOT, 'docs', 'docusaurus', 'static');
const ESLINT_INSPECTOR_OUTPUT_DIR = path.join(PROJECT_ROOT, '.eslint-config-inspector');
const ESLINT_INSPECTOR_TARGET_DIR = path.join(DOCUSAURUS_STATIC_DIR, 'eslint-inspector');

console.log('🚀 Building ESLint Config Inspector...');

/**
 * Build the ESLint Config Inspector static site
 */
async function buildESLintInspector() {
    try {
        console.log('📦 Building static ESLint Config Inspector...');

        // Change to project root to ensure eslint.config.js is found
        process.chdir(PROJECT_ROOT);

        // Build the static inspector
        execSync('npx @eslint/config-inspector@latest build', {
            stdio: 'inherit',
            cwd: PROJECT_ROOT
        });

        console.log('✅ ESLint Config Inspector built successfully');
    } catch (error) {
        console.error('❌ Failed to build ESLint Config Inspector:', error.message);
        throw error;
    }
}

/**
 * Copy the built inspector to docusaurus static directory
 */
async function copyToDocusaurus() {
    try {
        console.log('📁 Copying ESLint Inspector to Docusaurus static directory...');

        // Ensure target directory exists
        await fs.ensureDir(ESLINT_INSPECTOR_TARGET_DIR);

        // Remove existing inspector if it exists
        if (await fs.pathExists(ESLINT_INSPECTOR_TARGET_DIR)) {
            await fs.remove(ESLINT_INSPECTOR_TARGET_DIR);
        }

        // Copy the built inspector
        if (await fs.pathExists(ESLINT_INSPECTOR_OUTPUT_DIR)) {
            await fs.copy(ESLINT_INSPECTOR_OUTPUT_DIR, ESLINT_INSPECTOR_TARGET_DIR);
            console.log('✅ ESLint Inspector copied to Docusaurus static directory');
        } else {
            throw new Error(`ESLint Inspector output directory not found: ${ESLINT_INSPECTOR_OUTPUT_DIR}`);
        }

        // Clean up the temporary build directory
        await fs.remove(ESLINT_INSPECTOR_OUTPUT_DIR);
        console.log('🧹 Cleaned up temporary build directory');

    } catch (error) {
        console.error('❌ Failed to copy ESLint Inspector:', error.message);
        throw error;
    }
}

/**
 * Create an index redirect page for better SEO and usability
 */
async function createIndexRedirect() {
    try {
        console.log('📄 Creating index redirect page...');

        const redirectContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ESLint Config Inspector - Uptime Watcher</title>
    <meta name="description" content="Visual ESLint configuration inspector for the Uptime Watcher project">
    <meta http-equiv="refresh" content="0; url=./index.html">
    <link rel="canonical" href="./index.html">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #1a1a1a;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .loader {
            text-align: center;
        }
        .spinner {
            border: 4px solid #333;
            border-top: 4px solid #61dafb;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        a {
            color: #61dafb;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="loader">
        <div class="spinner"></div>
        <h2>Loading ESLint Config Inspector...</h2>
        <p>If you're not redirected automatically, <a href="./index.html">click here</a>.</p>
    </div>
    <script>
        // Redirect after a short delay for better UX
        setTimeout(() => {
            window.location.href = './index.html';
        }, 500);
    </script>
</body>
</html>`;

        const redirectPath = path.join(ESLINT_INSPECTOR_TARGET_DIR, 'redirect.html');
        await fs.writeFile(redirectPath, redirectContent);

        console.log('✅ Index redirect page created');
    } catch (error) {
        console.error('❌ Failed to create index redirect:', error.message);
        throw error;
    }
}

// Execute main logic using top-level await
console.log('🔧 Starting ESLint Config Inspector deployment process...');

try {
    await buildESLintInspector();
    await copyToDocusaurus();
    await createIndexRedirect();

    console.log('🎉 ESLint Config Inspector deployment completed successfully!');
    console.log(`📍 Available at: ${DOCUSAURUS_STATIC_DIR}/eslint-inspector/`);
    console.log('🌐 Will be accessible at: https://nick2bad4u.github.io/Uptime-Watcher/eslint-inspector/');

} catch (error) {
    console.error('💥 Deployment failed:', error.message);
    process.exit(1);
}

// Export functions for potential reuse
export {
    buildESLintInspector,
    copyToDocusaurus,
    createIndexRedirect
};
