#!/usr/bin/env node

/**
 * Simplified TypeScript to .mts Migration Script
 *
 * This script:
 * 1. Renames a .ts file to .mts
 * 2. Updates all local imports to use .mjs extensions
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Configuration
 */
const CONFIG = {
    sourceExtensions: ['.ts', '.tsx'],
    targetExtension: '.mts',
    jsExtension: '.mjs',
    createBackups: true
};

/**
 * Logger with colors
 */
const log = {
    info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
    success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
    warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
    error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`)
};

/**
 * Check if import path is local (should be updated)
 */
function isLocalImport(importPath) {
    // Local imports start with ./ or ../ or @shared/@electron/@app
    return /^(\.{1,2}\/|@(shared|electron|app)\/)/.test(importPath);
}

/**
 * Update import path to use .mjs extension
 */
function updateImportPath(importPath) {
    if (!isLocalImport(importPath)) {
        return importPath; // Skip npm packages
    }

    if (importPath.endsWith('.mjs')) {
        return importPath; // Already correct
    }

    // Remove existing extension and add .mjs
    const withoutExt = importPath.replace(/\.(ts|tsx|js|jsx)$/, '');
    return withoutExt + CONFIG.jsExtension;
}

/**
 * Process file content and update imports
 */
function processImports(content) {
    let updated = content;
    let changeCount = 0;

    // Pattern to match import statements
    const importPatterns = [
        // import ... from '...'
        /(\bimport\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+))?)?\s+from\s+['"`])([^'"`]+)(['"`])/g,
        // import type ... from '...'
        /(\bimport\s+type\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"`])([^'"`]+)(['"`])/g,
        // import('...')
        /(import\s*\(\s*['"`])([^'"`]+)(['"`]\s*\))/g,
        // export ... from '...'
        /(\bexport\s+(?:\{[^}]*\}|\*)\s+from\s+['"`])([^'"`]+)(['"`])/g
    ];

    importPatterns.forEach((pattern) => {
        updated = updated.replace(pattern, (match, prefix, importPath, suffix) => {
            const newPath = updateImportPath(importPath);
            if (newPath !== importPath) {
                changeCount++;
                log.info(`  Updated: "${importPath}" → "${newPath}"`);
                return prefix + newPath + suffix;
            }
            return match;
        });
    });

    log.info(`Updated ${changeCount} import statements`);
    return updated;
}

/**
 * Migrate a TypeScript file to .mts
 */
function migrateFile(filePath, isDryRun = false) {
    try {
        // Validate file
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const ext = path.extname(filePath);
        if (!CONFIG.sourceExtensions.includes(ext)) {
            throw new Error(`Unsupported extension: ${ext}`);
        }

        log.info(`Processing: ${filePath}`);

        // Read and process content
        const originalContent = fs.readFileSync(filePath, 'utf8');
        const updatedContent = processImports(originalContent);

        if (isDryRun) {
            log.info('=== DRY RUN - Preview of changes ===');
            if (originalContent !== updatedContent) {
                console.log('\nUpdated content:');
                console.log(updatedContent);
            } else {
                log.info('No changes needed');
            }
            return;
        }

        // Create backup
        if (CONFIG.createBackups) {
            const backupPath = filePath + '.backup';
            fs.copyFileSync(filePath, backupPath);
            log.info(`Backup created: ${backupPath}`);
        }

        // Create new file path
        const dir = path.dirname(filePath);
        const basename = path.basename(filePath, ext);
        const newFilePath = path.join(dir, basename + CONFIG.targetExtension);

        // Write new file
        fs.writeFileSync(newFilePath, updatedContent, 'utf8');

        // Remove original if different
        if (filePath !== newFilePath) {
            fs.unlinkSync(filePath);
            log.success(`Migrated: ${path.basename(filePath)} → ${path.basename(newFilePath)}`);
        } else {
            log.success(`Updated: ${path.basename(filePath)}`);
        }

    } catch (error) {
        log.error(`Failed to migrate ${filePath}: ${error.message}`);
        throw error;
    }
}

/**
 * Main function
 */
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help')) {
        console.log(`
TypeScript to .mts Migration Script

Usage: node migrate-to-mts-simple.mjs <file-path> [options]

Options:
  --dry-run     Preview changes without making them
  --no-backup   Don't create backup files
  --help        Show this help

Examples:
  node migrate-to-mts-simple.mjs ./electron/main.ts
  node migrate-to-mts-simple.mjs ./test/sample.ts --dry-run
        `);
        return;
    }

    const isDryRun = args.includes('--dry-run');
    const noBackup = args.includes('--no-backup');

    if (noBackup) {
        CONFIG.createBackups = false;
    }

    const filePath = args.find(arg => !arg.startsWith('--'));

    if (!filePath) {
        log.error('No file path provided');
        process.exit(1);
    }

    try {
        const resolvedPath = path.resolve(filePath);
        migrateFile(resolvedPath, isDryRun);
        log.success('Migration completed!');
    } catch (error) {
        log.error(error.message);
        process.exit(1);
    }
}

// Run if called directly
if (process.argv[1].endsWith('migrate-to-mts-simple.mjs')) {
    main();
}

export { migrateFile, processImports, updateImportPath, isLocalImport };
