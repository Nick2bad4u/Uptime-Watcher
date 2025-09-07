#!/usr/bin/env node

/**
 * @fileoverview Build script for ESLint Config Inspector
 *
 * This script builds a static version of the ESLint Config Inspector
 * and copies it to the Docusaurus static directory for deployment.
 */

import fs from 'fs-extra';

import { execSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

// Configuration - using process.cwd() since we'll run from project root
const PROJECT_ROOT = process.cwd();
const DOCUSAURUS_STATIC_DIR = path.join(PROJECT_ROOT, 'docs', 'docusaurus', 'static');
const ESLINT_INSPECTOR_OUTPUT_DIR = path.join(PROJECT_ROOT, '.eslint-config-inspector');
const ESLINT_INSPECTOR_TARGET_DIR = path.join(DOCUSAURUS_STATIC_DIR, 'eslint-inspector');

// Check for local testing flag
const CREATE_LOCAL_VERSION = process.argv.includes('--local') || process.argv.includes('-l');

console.log('🚀 Building ESLint Config Inspector...');
if (CREATE_LOCAL_VERSION) {
    console.log('📍 Local testing version will be created');
}

/**
 * Builds the static ESLint Config Inspector site using Nuxt.js and outputs it to the configured directory.
 *
 * @remarks
 * Although this project uses React/TypeScript, the ESLint Config Inspector itself is built with Nuxt.js
 * (as provided by the @eslint/config-inspector package). This function runs the build process for the
 * Inspector, setting environment variables to ensure proper asset paths for subdirectory deployment.
 * Throws an error if the build fails.
 *
 * @see copyToDocusaurus
 * @see fixAssetPaths
 * @see createLocalTestingVersion
 * @see {@link PROJECT_ROOT}
 * @see {@link ESLINT_INSPECTOR_OUTPUT_DIR}
 * @see {@link ESLINT_INSPECTOR_TARGET_DIR}
 *
 * @returns {Promise<void>} Resolves when the build completes successfully.
 */
async function buildESLintInspector() {
    try {
        console.log('📦 Building static ESLint Config Inspector...');

        // Change to project root to ensure eslint.config.js is found
        process.chdir(PROJECT_ROOT);

        // Build the static inspector with correct base URL configuration
        // Set Nuxt.js environment variables for proper subdirectory deployment
        const buildEnv = {
            ...process.env,
            NUXT_APP_BASE_URL: '/eslint-inspector/',
            NUXT_APP_BUILD_ASSETS_DIR: '/eslint-inspector/_nuxt/',
            NUXT_APP_CDN_URL: '/eslint-inspector/',
            // Alternative configuration names in case the above don't work
            NUXT_BASE_URL: '/eslint-inspector/',
            NUXT_BUILD_ASSETS_DIR: '/eslint-inspector/_nuxt/',
            NUXT_CDN_URL: '/eslint-inspector/',
        };

        execSync('npx @eslint/config-inspector@latest build', {
            stdio: 'inherit',
            cwd: PROJECT_ROOT,
            env: buildEnv
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

        // Fix asset paths in HTML files as a fallback
        await fixAssetPaths();

        // Clean up the temporary build directory
        await fs.remove(ESLINT_INSPECTOR_OUTPUT_DIR);
        console.log('🧹 Cleaned up temporary build directory');

    } catch (error) {
        console.error('❌ Failed to copy ESLint Inspector:', error.message);
        throw error;
    }
}

/**
 * Fix absolute asset paths in HTML files to work with subdirectory deployment
 */
async function fixAssetPaths() {
    try {
        console.log('🔧 Fixing asset paths in HTML files...');

        const htmlFiles = ['index.html', '200.html', '404.html', 'redirect.html'];

        await Promise.all(htmlFiles.map(async (htmlFile) => {
            const htmlPath = path.join(ESLINT_INSPECTOR_TARGET_DIR, htmlFile);

            if (await fs.pathExists(htmlPath)) {
                let content = await fs.readFile(htmlPath, 'utf8');

                // Fix asset paths - replace absolute paths with subdirectory paths
                content = content
                    .replaceAll('href="/_nuxt/', 'href="/eslint-inspector/_nuxt/')
                    .replaceAll('src="/_nuxt/', 'src="/eslint-inspector/_nuxt/')
                    .replaceAll('href="/favicon.', 'href="/eslint-inspector/favicon.')
                    .replaceAll('src="/favicon.', 'src="/eslint-inspector/favicon.')
                    // Fix any remaining absolute paths that might reference root (using regex for complex pattern)
                    .replaceAll(/"\/(?<temp2>(?!eslint-inspector\/|_nuxt\/|favicon\.|http|https|\/)[^"]+\.(?<temp1>js|css|png|jpg|svg|ico|json))/g, '"/eslint-inspector/$1')
                    // Fix the buildAssetsDir in the __NUXT__ config
                    .replaceAll('buildAssetsDir:"/_nuxt/"', 'buildAssetsDir:"/eslint-inspector/_nuxt/"')
                    // Fix baseURL in the __NUXT__ config
                    .replaceAll('baseURL:"/"', 'baseURL:"/eslint-inspector/"')
                    // Fix cdnURL in the __NUXT__ config
                    .replaceAll('cdnURL:""', 'cdnURL:"/eslint-inspector/"');

                await fs.writeFile(htmlPath, content);
                console.log(`✅ Fixed asset paths in ${htmlFile}`);
            }
        }));

        // Create a local testing version with relative paths only if flag is set
        if (CREATE_LOCAL_VERSION) {
            await createLocalTestingVersion();
        }

        console.log('✅ Asset path fixing completed');
    } catch (error) {
        console.error('❌ Failed to fix asset paths:', error.message);
        throw error;
    }
}

/**
 * Create a local testing version with relative paths for direct browser opening
 */
async function createLocalTestingVersion() {
    try {
        console.log('🔧 Creating local testing version with relative paths...');

        // Create the local test directory in a safe location (project temp folder)
        const localTestDir = path.join(PROJECT_ROOT, 'eslint-inspector-local-test');

        // Remove existing local test directory if it exists
        if (await fs.pathExists(localTestDir)) {
            await fs.remove(localTestDir);
        }

        await fs.ensureDir(localTestDir);

        // Copy all files to local test directory
        await fs.copy(ESLINT_INSPECTOR_TARGET_DIR, localTestDir);

        const htmlFiles = ['index.html', '200.html', '404.html'];

        await Promise.all(htmlFiles.map(async (htmlFile) => {
            const htmlPath = path.join(localTestDir, htmlFile);

            if (await fs.pathExists(htmlPath)) {
                let content = await fs.readFile(htmlPath, 'utf8');

                // Convert absolute paths to relative paths for local testing
                content = content
                    .replaceAll('href="/eslint-inspector/_nuxt/', 'href="./_nuxt/')
                    .replaceAll('src="/eslint-inspector/_nuxt/', 'src="./_nuxt/')
                    .replaceAll('href="/eslint-inspector/favicon.', 'href="./favicon.')
                    .replaceAll('src="/eslint-inspector/favicon.', 'src="./favicon.')
                    // Fix the __NUXT__ config for relative paths
                    .replaceAll('buildAssetsDir:"/eslint-inspector/_nuxt/"', 'buildAssetsDir:"./_nuxt/"')
                    .replaceAll('baseURL:"/eslint-inspector/"', 'baseURL:"./"')
                    .replaceAll('cdnURL:"/eslint-inspector/"', 'cdnURL:"./');

                await fs.writeFile(htmlPath, content);
            }
        }));

        console.log('✅ Local testing version created');
        console.log(`📁 Local test directory: ${localTestDir}`);
        console.log(`🌐 Open this file directly in browser: ${path.join(localTestDir, 'index.html')}`);
        console.log(`🗑️  Remember to delete ${localTestDir} when done testing`);
    } catch (error) {
        console.error('❌ Failed to create local testing version:', error.message);
        // Errors are suppressed here because creating a local testing version is an optional feature.
        // Any issues are logged to the console for visibility, but do not interrupt the main deployment process.
        // The main build and deployment will continue even if local testing setup fails.
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

/**
 * @file Entrypoint for ESLint Config Inspector deployment
 *
 * This script orchestrates the build and deployment process for the ESLint Config Inspector.
 * It performs the following steps:
 * 1. Builds the static inspector site using Nuxt.js.
 * 2. Copies the built files to the Docusaurus static directory.
 * 3. Fixes asset paths for subdirectory deployment.
 * 4. Optionally creates a local testing version with relative paths.
 * 5. Creates an index redirect page for improved SEO and usability.
 * Any errors during the process will be logged and the script will exit with a non-zero code.
 */

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

/**
 * Builds the static ESLint Config Inspector site using Nuxt.js and outputs it to the configured directory.
 *
 * @returns {Promise<void>} Resolves when the build completes successfully.
 */
export { buildESLintInspector };

/**
 * Copies the built ESLint Inspector to the Docusaurus static directory for deployment.
 *
 * @returns {Promise<void>} Resolves when the copy operation completes successfully.
 */
export { copyToDocusaurus };

/**
 * Creates an index redirect page for better SEO and usability in the ESLint Inspector deployment.
 *
 * @returns {Promise<void>} Resolves when the redirect page is created.
 */
export { createIndexRedirect };

/**
 * Fixes absolute asset paths in HTML files to work with subdirectory deployment.
 *
 * @returns {Promise<void>} Resolves when asset paths are fixed.
 */
export { fixAssetPaths };
