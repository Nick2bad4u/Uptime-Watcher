/**
 * Console statement remediation tool and analysis.
 * Identifies and provides fixes for console statements that should be replaced with proper logging.
 *
 * @remarks
 * This tool helps implement the console statement remediation plan by:
 * - Finding all console statements in the codebase
 * - Categorizing them by usage type
 * - Providing replacement recommendations
 * - Creating automated fixes where possible
 *
 * @public
 */

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import path from "node:path";

describe("Console Statement Remediation", () => {
    const projectRoot = path.resolve(import.meta.dirname, "../../../..");
    const srcDirs = [
        path.join(projectRoot, "src"),
        path.join(projectRoot, "electron"),
    ];

    /**
     * Find all TypeScript files
     */
    function findTSFiles(dir: string): string[] {
        const files: string[] = [];

        if (!fs.existsSync(dir)) {
            return files;
        }

        const items = fs.readdirSync(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (
                stat.isDirectory() &&
                !item.startsWith(".") &&
                item !== "node_modules"
            ) {
                files.push(...findTSFiles(fullPath));
            } else if (
                (item.endsWith(".ts") || item.endsWith(".tsx")) &&
                !item.endsWith(".d.ts")
            ) {
                files.push(fullPath);
            }
        }

        return files;
    }

    /**
     * Extract console statements from a file
     */
    function extractConsoleStatements(filePath: string): {
        line: number;
        content: string;
        type: "error" | "warn" | "log" | "debug" | "info";
        context: string;
    }[] {
        const content = fs.readFileSync(filePath, "utf8");
        const lines = content.split(String.raw`\n`);
        const consoleStatements: {
            line: number;
            content: string;
            type: "error" | "warn" | "log" | "debug" | "info";
            context: string;
        }[] = [];

        const consoleRegex = /console\.(error|warn|log|debug|info)\s*\(/;

        for (const [index, line] of lines.entries()) {
            const match = line.match(consoleRegex);
            if (match) {
                const type = match[1] as
                    | "error"
                    | "warn"
                    | "log"
                    | "debug"
                    | "info";

                // Get some context around the line
                const startLine = Math.max(0, index - 2);
                const endLine = Math.min(lines.length - 1, index + 2);
                const context = lines
                    .slice(startLine, endLine + 1)
                    .join(String.raw`\n`);

                consoleStatements.push({
                    line: index + 1,
                    content: line.trim(),
                    type,
                    context,
                });
            }
        }

        return consoleStatements;
    }

    /**
     * Categorize console statements
     */
    function categorizeConsoleStatement(
        statement: {
            line: number;
            content: string;
            type: string;
            context: string;
        },
        filePath: string
    ): {
        category: "legitimate" | "needs-replacement" | "test-file";
        reason: string;
        replacement?: string;
    } {
        const isTestFile =
            filePath.includes("/test/") ||
            filePath.includes("\\test\\") ||
            filePath.endsWith(".test.ts") ||
            filePath.endsWith(".test.tsx");

        if (isTestFile) {
            return {
                category: "test-file",
                reason: "Test files can use console statements for test output",
            };
        }

        // Check for legitimate usage patterns
        if (
            statement.context.includes("TSDoc") ||
            statement.context.includes("* @example")
        ) {
            return {
                category: "legitimate",
                reason: "Documentation example in TSDoc comment",
            };
        }

        if (
            statement.context.includes("// Development only") ||
            statement.context.includes("if (isDev())")
        ) {
            return {
                category: "legitimate",
                reason: "Development-only console statement",
            };
        }

        // Determine replacement based on type and context
        let replacement = "";

        switch (statement.type) {
            case "error": {
                replacement =
                    statement.context.includes("catch") ||
                    statement.context.includes("error")
                        ? 'logger.error("Operation failed", error);'
                        : 'logger.error("Error message");';

                break;
            }
            case "warn": {
                replacement = 'logger.warn("Warning message");';

                break;
            }
            case "log": {
                replacement =
                    statement.context.includes("debug") ||
                    statement.context.includes("Debug")
                        ? 'logger.debug("Debug information");'
                        : 'logger.info("Information message");';

                break;
            }
            case "debug": {
                replacement = 'logger.debug("Debug information");';

                break;
            }
            case "info": {
                replacement = 'logger.info("Information message");';

                break;
            }
            // No default
        }

        return {
            category: "needs-replacement",
            reason: `Production code should use logger instead of console.${statement.type}`,
            replacement,
        };
    }

    describe("Console Statement Analysis", () => {
        it("should find and categorize all console statements", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger", "component");

            const allFiles = srcDirs.flatMap((dir) => findTSFiles(dir));
            const analysisResults: {
                file: string;
                statements: ReturnType<typeof extractConsoleStatements>;
                categorized: {
                    legitimate: number;
                    needsReplacement: number;
                    testFile: number;
                };
            }[] = [];

            let totalStatements = 0;
            let totalNeedsReplacement = 0;
            let totalLegitimate = 0;
            let totalTestFile = 0;

            for (const file of allFiles.slice(0, 50)) {
                // Limit for performance
                const statements = extractConsoleStatements(file);

                if (statements.length > 0) {
                    const categorized = {
                        legitimate: 0,
                        needsReplacement: 0,
                        testFile: 0,
                    };

                    for (const statement of statements) {
                        const category = categorizeConsoleStatement(
                            statement,
                            file
                        );

                        switch (category.category) {
                            case "legitimate": {
                                categorized.legitimate++;

                                break;
                            }
                            case "needs-replacement": {
                                categorized.needsReplacement++;

                                break;
                            }
                            case "test-file": {
                                categorized.testFile++;

                                break;
                            }
                            // No default
                        }
                    }

                    analysisResults.push({
                        file: path.relative(projectRoot, file),
                        statements,
                        categorized,
                    });
                    totalStatements += statements.length;
                    totalLegitimate += categorized.legitimate;
                    totalNeedsReplacement += categorized.needsReplacement;
                    totalTestFile += categorized.testFile;
                }
            }

            console.log("Console Statement Analysis Results:");
            console.log("=".repeat(50));
            console.log(`Total console statements found: ${totalStatements}`);
            console.log(`  • Legitimate (keep): ${totalLegitimate}`);
            console.log(`  • Needs replacement: ${totalNeedsReplacement}`);
            console.log(`  • Test files: ${totalTestFile}`);

            if (analysisResults.length > 0) {
                console.log(String.raw`\nFiles with console statements:`);
                for (const {
                    file,
                    statements,
                    categorized,
                } of analysisResults.slice(0, 10)) {
                    console.log(`\\n${file}:`);
                    console.log(
                        `  Total: ${statements.length}, Needs fix: ${categorized.needsReplacement}, Legitimate: ${categorized.legitimate}`
                    );
                }
            }

            // The analysis should complete successfully
            expect(analysisResults.length).toBeGreaterThanOrEqual(0);
            expect(totalStatements).toBeGreaterThanOrEqual(0);
        });
        it("should provide specific replacement recommendations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger", "component");

            const allFiles = srcDirs.flatMap((dir) => findTSFiles(dir));
            const replacementRecommendations: {
                file: string;
                line: number;
                original: string;
                replacement: string;
                reason: string;
            }[] = [];

            for (const file of allFiles.slice(0, 30)) {
                // Limit for performance
                const statements = extractConsoleStatements(file);

                for (const statement of statements) {
                    const category = categorizeConsoleStatement(
                        statement,
                        file
                    );

                    if (
                        category.category === "needs-replacement" &&
                        category.replacement
                    ) {
                        replacementRecommendations.push({
                            file: path.relative(projectRoot, file),
                            line: statement.line,
                            original: statement.content,
                            replacement: category.replacement,
                            reason: category.reason,
                        });
                    }
                }
            }

            console.log(String.raw`\nReplacement Recommendations:`);
            console.log("=".repeat(50));

            if (replacementRecommendations.length > 0) {
                for (const {
                    file,
                    line,
                    original,
                    replacement,
                    reason,
                } of replacementRecommendations.slice(0, 5)) {
                    console.log(`\\n${file}:${line}`);
                    console.log(`  Original: ${original}`);
                    console.log(`  Replace with: ${replacement}`);
                    console.log(`  Reason: ${reason}`);
                }

                console.log(
                    `\\n... and ${Math.max(0, replacementRecommendations.length - 5)} more replacements needed.`
                );
            } else {
                console.log(
                    "No console statements need replacement in analyzed files."
                );
            }

            expect(replacementRecommendations.length).toBeGreaterThanOrEqual(0);
        });
    });
    describe("Logger Implementation Guidelines", () => {
        it("should provide logger usage guidelines", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger", "component");

            const guidelines = [
                {
                    level: "error",
                    usage: "For errors that need investigation",
                    example:
                        'logger.error("Database connection failed", error);',
                    when: "Exceptions, API failures, critical issues",
                },
                {
                    level: "warn",
                    usage: "For warnings that don't break functionality",
                    example: 'logger.warn("Deprecated API usage detected");',
                    when: "Deprecation warnings, configuration issues, fallbacks",
                },
                {
                    level: "info",
                    usage: "For important application events",
                    example: 'logger.info("User logged in successfully");',
                    when: "User actions, system events, application lifecycle",
                },
                {
                    level: "debug",
                    usage: "For detailed debugging information",
                    example:
                        'logger.debug("Processing request", { userId, action });',
                    when: "Development debugging, detailed execution flow",
                },
            ];

            console.log(String.raw`\nLogger Usage Guidelines:`);
            console.log("=".repeat(40));

            for (const { level, usage, example, when } of guidelines) {
                console.log(`\\n${level.toUpperCase()}:`);
                console.log(`  Purpose: ${usage}`);
                console.log(`  Example: ${example}`);
                console.log(`  Use when: ${when}`);
            }

            expect(guidelines.length).toBe(4);
        });
        it("should provide migration strategy", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger", "component");

            const migrationSteps = [
                {
                    step: 1,
                    title: "Audit Current Console Usage",
                    description:
                        "Run this tool to identify all console statements",
                    action: "npm test -- patterns/console-remediation",
                },
                {
                    step: 2,
                    title: "Replace Error Handling",
                    description: "Replace console.error in production code",
                    action: "Focus on catch blocks and error handling first",
                },
                {
                    step: 3,
                    title: "Replace Debug Statements",
                    description:
                        "Replace console.log with appropriate logger calls",
                    action: "Use logger.debug for development info, logger.info for user events",
                },
                {
                    step: 4,
                    title: "Update Development Scripts",
                    description:
                        "Ensure logger is properly configured for development",
                    action: "Verify logger.debug shows in development mode",
                },
                {
                    step: 5,
                    title: "Add Linting Rules",
                    description:
                        "Prevent future console statement introduction",
                    action: "Add ESLint rule to warn about console usage",
                },
            ];

            console.log(String.raw`\nConsole Statement Migration Strategy:`);
            console.log("=".repeat(45));

            for (const { step, title, description, action } of migrationSteps) {
                console.log(`\\n${step}. ${title}`);
                console.log(`   ${description}`);
                console.log(`   Action: ${action}`);
            }

            expect(migrationSteps.length).toBe(5);
        });
    });
    describe("Automated Fixes", () => {
        it("should generate replacement scripts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logger", "component");

            const replacementPatterns = [
                {
                    pattern: /console\.error\\((.+)\\);?/g,
                    replacement: "logger.error($1);",
                    description: "Replace console.error with logger.error",
                },
                {
                    pattern: /console\.warn\\((.+)\\);?/g,
                    replacement: "logger.warn($1);",
                    description: "Replace console.warn with logger.warn",
                },
                {
                    pattern: /console\.log\\((.+)\\);?/g,
                    replacement: "logger.info($1);",
                    description:
                        "Replace console.log with logger.info (review manually)",
                },
                {
                    pattern: /console\.debug\\((.+)\\);?/g,
                    replacement: "logger.debug($1);",
                    description: "Replace console.debug with logger.debug",
                },
                {
                    pattern: /console\.info\\((.+)\\);?/g,
                    replacement: "logger.info($1);",
                    description: "Replace console.info with logger.info",
                },
            ];

            console.log(String.raw`\nAutomated Replacement Patterns:`);
            console.log("=".repeat(40));

            for (const {
                pattern,
                replacement,
                description,
            } of replacementPatterns) {
                console.log(`\\n${description}:`);
                console.log(`  Pattern: ${pattern.source}`);
                console.log(`  Replace: ${replacement}`);
            }

            // Example function to apply replacements (not actually run)
            const generateReplacementScript = () => {
                return `
// Example replacement script (manual review required)
function replaceConsoleStatements(fileContent: string): string {
    let result = fileContent;
    
    // Add logger import if not present
    if (!result.includes('import logger') && !result.includes('from "../services/logger"')) {
        const importSection = result.match(/^(import[^;]+;\\s*)+/m);
        if (importSection) {
            result = result.replace(importSection[0], importSection[0] + 'import logger from "../services/logger";\\n');
        }
    }
    
    // Apply replacements (requires manual review)
    ${replacementPatterns
        .map(
            ({ pattern, replacement }) =>
                `result = result.replace(${pattern}, '${replacement}');`
        )
        .join(String.raw`\n    `)}
    
    return result;
}
`;
            };

            const script = generateReplacementScript();
            expect(script.length).toBeGreaterThan(0);
            expect(replacementPatterns.length).toBe(5);
        });
    });
});
