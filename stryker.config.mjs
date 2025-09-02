// @ts-check
/** @type {import("@stryker-mutator/api/core").PartialStrykerOptions} */

const config = {
    // === CORE CONFIGURATION ===
    allowConsoleColors: true, // Enable colors in console
    allowEmpty: false,
    checkerNodeArgs: [],

    checkers: ["typescript"], // 🔍 Enable TypeScript checking for mutants
    cleanTempDir: true, // Clean up after successful runs

    // 📝 CLEAR TEXT REPORTER ENHANCEMENTS
    clearTextReporter: {
        allowColor: true,
        allowEmojis: true, // 🎯 Visual feedback
        logTests: true,
        maxTestsToLog: 5, // Show more test details
        reportMutants: true,
        reportScoreTable: true,
        reportTests: true,
        skipFull: false, // Show all results
    },

    concurrency: 22,

    // ⚡ COVERAGE ANALYSIS - Note: Vitest runner ignores this and forces "perTest" (optimal)
    coverageAnalysis: "perTest",

    // 📊 DASHBOARD REPORTER (Automatic GitHub Actions Integration)
    // 📘 From: https://stryker-mutator.io/docs/General/dashboard/
    // GitHub Actions automatically provides: project and version from environment
    // Set STRYKER_DASHBOARD_API_KEY as repository secret
    dashboard: {
        baseUrl: "https://dashboard.stryker-mutator.io", // Default URL
        project: "github.com/Nick2bad4u/Uptime-Watcher", // Will be auto-detected in CI
        // @ts-expect-error -- Type definition missing reportType
        reportType: "full", // Options: "full" | "mutationScore"
    },

    disableBail: false, // Bail on first test failure for performance

    disableTypeChecks: false, // Keep type checking enabled for accuracy

    dryRunTimeoutMinutes: 10, // Longer dry run timeout for complex setup
    eventReporter: {
        baseDir: "coverage/events",
    },
    // @ts-expect-error -- Type definition missing reportType
    fileLogLevel: "trace", // Detailed logs in stryker.log (off|fatal|error|warn|info|debug|trace)
    // 📊 HTML REPORTER CONFIGURATION
    htmlReporter: {
        fileName: "coverage/stryker.html",
    },
    ignorePatterns: [
        "dist",
        "dist-*",
        "node_modules",
        ".git",
        "*.tsbuildinfo",
        "/stryker.log",
        "_ZENTASKS*",
        ".agentic-tools*",
        ".devskim.json",
        ".github/chatmodes/**",
        ".github/instructions/**",
        ".github/ISSUE_TEMPLATE/**",
        ".github/prompts/**",
        ".github/PULL_REQUEST_TEMPLATE/**",
        ".stryker-tmp/**",
        "**/_ZENTASKS*",
        "**/.agentic-tools*",
        "**/.cache",
        "**/chatproject.md",
        "**/coverage-results.json",
        "**/Coverage/**",
        "**/coverage/**",
        "**/dist-electron/**",
        "**/dist-shared/**",
        "**/dist-scripts/**",
        "**/dist/**",
        "**/node_modules/**",
        "**/package-lock.json",
        "**/release/**",
        "CHANGELOG.md",
        "coverage-report.json",
        "Coverage/",
        "coverage/",
        "dist-electron/",
        "**/**dist**/**",
        "dist/",
        "docs/Archive/**",
        "docs/docusaurus/.docusaurus/**",
        "docs/docusaurus/build/**",
        "docs/docusaurus/docs/**",
        "docs/Logger-Error-report.md",
        "docs/Packages/**",
        "docs/Reviews/**",
        "html/**",
        "node_modules/**",
        "release/",
        "report/**",
    ],
    ignoreStatic: true, // 🎯 IGNORE STATIC MUTANTS - Performance improvement
    incremental: true, // 🚀 INCREMENTAL MODE - Major performance boost for subsequent runs
    incrementalFile: "reports/stryker-incremental.json",
    inPlace: false,
    // 📄 JSON REPORTER CONFIGURATION
    jsonReporter: {
        fileName: "coverage/stryker.json",
    },
    // @ts-expect-error -- Type definition missing reportType
    logLevel: "info", // Console log level (off|fatal|error|warn|info|debug|trace)
    maxTestRunnerReuse: 100, // Reuse test runners for performance
    // === COMPREHENSIVE MUTATION SCOPE ===
    mutate: [
        // 🔥 HIGH PRIORITY: Core business logic
        "src/**/*.ts",
        "src/**/*.mjs",
        "src/**/*.tsx",
        "src/**/*.js",

        "shared/**/*.ts",
        "shared/**/*.mjs",
        "shared/**/*.tsx",
        "shared/**/*.js",

        "electron/**/*.ts",
        "electron/**/*.mjs",
        "electron/**/*.tsx",
        "electron/**/*.js",

        // ❌ EXCLUSIONS
        "!**/*.test.{ts,tsx}",
        "!**/*.spec.{ts,tsx}",
        "!**/*.d.ts",
        "!**/__tests__/**",
        "!**/test/**",
        "!**/tests/**",
        "!**/node_modules/**",
        "!**/dist/**",
        "!**/dist-*/**",
        "!**/coverage/**",
        "!**/*.config.{js,ts,mjs}",
        "!**/vite.config.ts",
        "!**/vitest.config.ts",
        "!**/types.ts",
        "!**/interfaces.ts",
    ],
    // === ADVANCED MUTATOR CONFIGURATION ===
    // mutator: {
    //     // 🎯 EXCLUDE SPECIFIC MUTATION TYPES (if needed)
    //     excludedMutations: [
    //         // Uncomment to exclude specific mutator types:
    //         // "StringLiteral",       // Skip string mutations
    //         // "BooleanLiteral",      // Skip boolean mutations
    //         // "ArithmeticOperator"   // Skip math operator mutations
    //     ],
    //     plugins: [], // Add custom mutator plugins if needed
    // },

    packageManager: "npm",

    // === ENHANCED REPORTING ===
    reporters: [
        "html",
        "clear-text",
        "progress",
        "json",
        "dashboard",
    ],

    symlinkNodeModules: true, // Symlink node_modules for better compatibility

    testRunner: "vitest",

    // === ADVANCED THRESHOLDS ===
    thresholds: {
        break: 60, // Fail build if below 60%
        high: 85, // Higher bar for excellence
        low: 70, // Reasonable minimum
    },

    timeoutFactor: 1.5,

    timeoutMS: 60_000,

    tsconfigFile: "tsconfig.json",

    // === TYPESCRIPT CHECKER CONFIGURATION ===
    // 📘 From: https://stryker-mutator.io/docs/stryker-js/typescript-checker/
    // Features: Type check each mutant, mark invalid mutants as CompileError
    // Automatically overrides: allowUnreachableCode: true, noUnusedLocals: false, noUnusedParameters: false
    typescriptChecker: {
        prioritizePerformanceOverAccuracy: true, // true = faster but may miss some CompileErrors
    },

    // === VITEST INTEGRATION ===
    // 📘 From: https://stryker-mutator.io/docs/stryker-js/vitest-runner/
    // Non-overridable options: threads: true, coverage: {enabled: false}, singleThread: true,
    // watch: false, bail: (based on disableBail), onConsoleLog: () => false
    vitest: {
        configFile: "./vitest.config.ts", // Path to vitest config file
        related: true, // 🚀 Only run tests related to mutated files (performance boost)
        // dir: "packages"                 // 📦 Optional: --dir for monorepo support
    },

    // === WARNING CONFIGURATION ===
    warnings: {
        preprocessorErrors: true,
        slow: true, // Alert about performance optimizations
        unknownOptions: true,
        unserializableOptions: true, // Required by WarningOptions interface
    },
};
export default config;
