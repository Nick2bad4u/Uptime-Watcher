#!/usr/bin/env node

/**
 * Enhanced Test Metadata Manager for Vitest
 * Automatically adds comprehensive metadata to test files using Vitest context features
 *
 * Usage: node scripts/enhance-test-metadata.mjs [options]
 *
 * Options:
 *   --dry-run, -d     Show what would be changed without making changes
 *   --pattern, -p     Glob pattern for test files
 *   --force, -f       Force update files that already have metadata
 *   --help, -h        Show this help message
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, basename, dirname, resolve, sep } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Command line argument parsing
const args = process.argv.slice(2);
const options = {
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    pattern: getArgValue('--pattern', '-p') || '**/*.test.ts',
    force: args.includes('--force') || args.includes('-f'),
    help: args.includes('--help') || args.includes('-h')
};

function getArgValue(longForm, shortForm) {
    const index = args.findIndex(arg => arg === longForm || arg === shortForm);
    return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
}

if (options.help) {
    console.log(`
Enhanced Test Metadata Manager for Vitest

Usage:
  node scripts/enhance-test-metadata.mjs [options]

Options:
  --dry-run, -d     Show what would be changed without making changes
  --pattern, -p     Glob pattern for test files (default: **/*.test.ts)
  --force, -f       Force update files that already have metadata
  --help, -h        Show this help message

Examples:
  node scripts/enhance-test-metadata.mjs --dry-run
  node scripts/enhance-test-metadata.mjs --pattern "electron/**/*.test.ts"
  node scripts/enhance-test-metadata.mjs --force
`);
    process.exit(0);
}

/**
 * Determines the component name from file path
 * @param {string} filePath - The test file path
 * @returns {string} Component name
 */
function getComponentName(filePath) {
    const fileName = basename(filePath, '.test.ts');
    return fileName.replace(/\.(comprehensive|debug|coverage|foundation|simple|minimal|targeted|fixed|working)$/, '');
}

/**
 * Determines the category from file path
 * @param {string} filePath - The test file path
 * @returns {string} Category
 */
function getCategory(filePath) {
    const pathParts = filePath.split(sep);

    if (pathParts.includes('managers')) return 'Manager';
    if (pathParts.includes('services')) return 'Service';
    if (pathParts.includes('utils')) return 'Utility';
    if (pathParts.includes('events')) return 'Event System';
    if (pathParts.includes('hooks')) return 'Hook';
    if (pathParts.includes('components')) return 'Component';
    if (pathParts.includes('stores')) return 'Store';
    if (pathParts.includes('database')) return 'Database';
    if (pathParts.includes('validation')) return 'Validation';
    if (pathParts.includes('shared')) return 'Shared';

    return 'Core';
}

/**
 * Determines test type from test name
 * @param {string} testName - The test function name
 * @returns {string} Test type
 */
function getTestType(testName) {
    const lowerName = testName.toLowerCase();

    if (lowerName.includes('constructor') || lowerName.includes('create')) return 'Constructor';
    if (lowerName.includes('initialize') || lowerName.includes('init')) return 'Initialization';
    if (lowerName.includes('error') || lowerName.includes('fail')) return 'Error Handling';
    if (lowerName.includes('validate') || lowerName.includes('validation')) return 'Validation';
    if (lowerName.includes('backup')) return 'Backup Operation';
    if (lowerName.includes('export')) return 'Export Operation';
    if (lowerName.includes('import')) return 'Import Operation';
    if (lowerName.includes('load') || lowerName.includes('loading')) return 'Data Loading';
    if (lowerName.includes('save') || lowerName.includes('saving')) return 'Data Saving';
    if (lowerName.includes('delete') || lowerName.includes('remove')) return 'Data Deletion';
    if (lowerName.includes('update')) return 'Data Update';
    if (lowerName.includes('get') || lowerName.includes('find') || lowerName.includes('retrieve')) return 'Data Retrieval';
    if (lowerName.includes('monitor')) return 'Monitoring';
    if (lowerName.includes('event')) return 'Event Processing';
    if (lowerName.includes('cache')) return 'Caching';
    if (lowerName.includes('limit')) return 'Configuration';

    return 'Business Logic';
}

/**
 * Generates metadata annotations for a test function
 * @param {string} filePath - The test file path
 * @param {string} testName - The test function name
 * @returns {string} Metadata annotation code
 */
function generateMetadata(filePath, testName) {
    const component = getComponentName(filePath);
    const category = getCategory(filePath);
    const type = getTestType(testName);

    return `            await annotate(\`Testing: \${task.name}\`, "functional");
            await annotate("Component: ${component}", "component");
            await annotate("Category: ${category}", "category");
            await annotate("Type: ${type}", "type");`;
}

/**
 * Processes a test file to add metadata
 * @param {string} filePath - Path to the test file
 * @returns {boolean} Whether the file was modified
 */
function processTestFile(filePath) {
    try {
        const content = readFileSync(filePath, 'utf8');

        // Skip if file already has metadata (unless force flag is used)
        if (!options.force && (content.includes('task,') || content.includes('annotate,'))) {
            console.log(`📋 Skipping ${filePath} - already has metadata`);
            return false;
        }

        // Check if this is a valid test file structure
        if (!content.includes('it(') && !content.includes('test(')) {
            console.log(`⚠️  Skipping ${filePath} - no test functions found`);
            return false;
        }

        let newContent = content;
        let hasChanges = false;

        // Add imports if not present
        if (!content.includes('task,') && !content.includes('annotate,')) {
            const importPattern = /import\s+{([^}]*)}\s+from\s+['"`]vitest['"`]/;
            const match = content.match(importPattern);

            if (match) {
                const currentImports = match[1].trim();
                const newImports = currentImports ? `${currentImports}, task, annotate` : 'task, annotate';
                newContent = newContent.replace(importPattern, `import { ${newImports} } from 'vitest'`);
                hasChanges = true;
            }
        }

        // Process test functions
        const testFunctionPattern = /(it|test)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(async\s*)?\(\s*(\{[^}]*\})?\s*\)\s*=>\s*\{/g;
        let match;

        while ((match = testFunctionPattern.exec(content)) !== null) {
            const fullMatch = match[0];
            const testName = match[2];

            // Skip if already has context parameters
            if (fullMatch.includes('task') || fullMatch.includes('annotate')) {
                continue;
            }

            const replacement = fullMatch.replace(
                /\(\s*(\{[^}]*\})?\s*\)/,
                '({ task, annotate })'
            );

            newContent = newContent.replace(fullMatch, replacement);
            hasChanges = true;

            // Add metadata after the opening brace
            const testBodyStart = newContent.indexOf('{', newContent.indexOf(replacement));
            if (testBodyStart !== -1) {
                const metadata = generateMetadata(filePath, testName);
                const insertPoint = testBodyStart + 1;
                const beforeInsertion = newContent.substring(0, insertPoint);
                const afterInsertion = newContent.substring(insertPoint);

                newContent = beforeInsertion + '\n' + metadata + '\n' + afterInsertion;
                hasChanges = true;
            }
        }

        if (hasChanges) {
            if (options.dryRun) {
                console.log(`🔍 [DRY RUN] Would update: ${filePath}`);
                return true;
            } else {
                writeFileSync(filePath, newContent);
                console.log(`✅ Enhanced: ${filePath}`);
                return true;
            }
        } else {
            console.log(`📝 No changes needed: ${filePath}`);
            return false;
        }

    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Recursively find test files matching the pattern
 * @param {string} dir - Directory to search
 * @param {string} pattern - File pattern to match
 * @returns {string[]} Array of test file paths
 */
function findTestFiles(dir, pattern) {
    const files = [];

    try {
        const items = readdirSync(dir);

        for (const item of items) {
            const itemPath = join(dir, item);
            const stat = statSync(itemPath);

            if (stat.isDirectory() && !item.startsWith('.') && !['node_modules', 'dist', 'coverage'].includes(item)) {
                files.push(...findTestFiles(itemPath, pattern));
            } else if (stat.isFile() && item.endsWith('.test.ts')) {
                files.push(itemPath);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error.message);
    }

    return files;
}

/**
 * Main execution function
 */
function main() {
    console.log('🚀 Enhanced Test Metadata Manager');
    console.log(`📁 Pattern: ${options.pattern}`);
    console.log(`🔍 Mode: ${options.dryRun ? 'DRY RUN' : 'EXECUTE'}`);
    console.log(`💪 Force: ${options.force ? 'YES' : 'NO'}`);
    console.log('');

    const projectRoot = resolve(__dirname, '..');
    const testFiles = findTestFiles(projectRoot, options.pattern);

    console.log(`📊 Found ${testFiles.length} test files`);
    console.log('');

    let processed = 0;
    let modified = 0;
    let errors = 0;

    for (const filePath of testFiles) {
        processed++;
        try {
            if (processTestFile(filePath)) {
                modified++;
            }
        } catch (error) {
            console.error(`❌ Error processing ${filePath}:`, error.message);
            errors++;
        }
    }

    console.log('');
    console.log('📊 Summary:');
    console.log(`   📁 Files processed: ${processed}`);
    console.log(`   ✅ Files modified: ${modified}`);
    console.log(`   ❌ Errors: ${errors}`);

    if (options.dryRun) {
        console.log('');
        console.log('🔍 This was a dry run. Use without --dry-run to apply changes.');
    }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { processTestFile, generateMetadata, getComponentName, getCategory, getTestType };
