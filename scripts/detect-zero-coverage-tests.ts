/**
 * Vitest zero coverage detector.
 *
 * @remarks
 * This script enumerates Vitest test files, executes them individually with
 * coverage enabled, and highlights the ones that do not touch any executable
 * source lines. It intentionally runs tests serially to avoid cross-talk
 * between coverage runs and delivers a machine-readable summary to help prune
 * stale tests safely.
 *
 * @packageDocumentation
 */

import { createCoverageMap, type CoverageMapData } from "istanbul-lib-coverage";
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, mkdtemp, readFile, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const execFileAsync = promisify(execFile);
const ZERO_COVERAGE_CONFIG_PATH = path.join(
    "config",
    "testing",
    "vitest.zero-coverage.config.ts"
);
const RETRYABLE_ERROR_PATTERN =
    /\b(?:EBUSY|EPERM)\b|resource busy or locked|operation not permitted/iu;
const MAX_VITEST_ATTEMPTS = 7;
const BASE_RETRY_DELAY_MS = 250;
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Executes Vitest with automatic retries for transient filesystem issues that
 * regularly appear on Windows when the cache directory is still in use. Now
 * includes a timeout to prevent indefinite hangs.
 */
async function runVitestCommand(
    cwd: string,
    vitestArgs: readonly string[],
    timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<{ stdout: string; stderr: string }> {
    console.log(
        `[runVitestCommand] Starting Vitest command with args: ${vitestArgs.join(" ")} (timeout: ${timeoutMs}ms)`
    );
    for (let attempt = 1; attempt <= MAX_VITEST_ATTEMPTS; attempt += 1) {
        const invocation = getVitestInvocation(cwd, vitestArgs);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const result = await execFileAsync(
                invocation.command,
                invocation.args,
                {
                    cwd,
                    env: process.env,
                    windowsHide: true,
                    maxBuffer: 1024 * 1024 * 20,
                    signal: controller.signal,
                }
            );
            clearTimeout(timeoutId);
            console.log(
                `[runVitestCommand] Command succeeded on attempt ${attempt}`
            );
            return result;
        } catch (error) {
            clearTimeout(timeoutId);
            const message =
                error instanceof Error
                    ? `${error.message}\n${String((error as { stderr?: string }).stderr ?? "")}`
                    : String(error);
            const shouldRetry =
                RETRYABLE_ERROR_PATTERN.test(message) &&
                !controller.signal.aborted;
            if (!shouldRetry || attempt === MAX_VITEST_ATTEMPTS) {
                console.error(
                    `[runVitestCommand] Command failed after ${attempt} attempts: ${message}`
                );
                throw error;
            }

            const delayMs = BASE_RETRY_DELAY_MS * attempt;
            const firstLine = message.split("\n", 1)[0]?.trim() ?? message;
            const retryableError = error as Error & {
                dest?: string;
                path?: string;
            };
            if (retryableError.dest) {
                try {
                    await rm(retryableError.dest, {
                        recursive: true,
                        force: true,
                    });
                } catch (cleanupError) {
                    if ((cleanupError as { code?: string }).code !== "ENOENT") {
                        console.warn(
                            `[vitest retry] Failed to clear destination cache '${retryableError.dest}': ${cleanupError instanceof Error ? cleanupError.message : cleanupError}`
                        );
                    }
                }
            }
            if (retryableError.path) {
                try {
                    await rm(retryableError.path, {
                        recursive: true,
                        force: true,
                    });
                } catch (cleanupError) {
                    if ((cleanupError as { code?: string }).code !== "ENOENT") {
                        console.warn(
                            `[vitest retry] Failed to clear temporary cache '${retryableError.path}': ${cleanupError instanceof Error ? cleanupError.message : cleanupError}`
                        );
                    }
                }
            }
            console.warn(
                `[vitest retry] Attempt ${attempt} encountered '${firstLine}'. Retrying in ${delayMs}ms...`
            );
            await sleep(delayMs);
        }
    }

    return { stdout: "", stderr: "" };
}

/**
 * Resolves the executable path and argument list for invoking Vitest through
 * the local dependency.
 */
function getVitestInvocation(
    cwd: string,
    vitestArgs: readonly string[]
): { command: string; args: string[] } {
    const entrypoint = path.join(cwd, "node_modules", "vitest", "vitest.mjs");
    return {
        command: process.execPath,
        args: [entrypoint, ...vitestArgs],
    };
}

/**
 * CLI options accepted by the detector.
 */
interface CliOptions {
    /** Optional Vitest config file to load. */
    readonly configPath: string | null;
    /** Optional regex filter applied to the discovered test file list. */
    readonly filePattern: RegExp | null;
    /** Maximum number of test files to execute before stopping. */
    readonly maxFiles: number | null;
    /** When true, skip executing tests and only print the discovered list. */
    readonly dryRun: boolean;
    /** When true, keep the generated JSON reports for later inspection. */
    readonly keepReports: boolean;
    /** Working directory for all spawned Vitest processes. */
    readonly cwd: string;
    /** Optional explicit list of files provided via CLI. */
    readonly explicitFiles: readonly string[];
    /** Timeout in milliseconds for each Vitest command execution. */
    readonly timeoutMs: number;
}

/**
 * Coverage summary for a single test execution.
 */
interface CoverageSummary {
    /** List of files reported by Istanbul for this run. */
    readonly instrumentedFiles: readonly string[];
    /**
     * Total number of executable statements covered. Acts as the primary signal
     * to decide whether the test touched any runtime code.
     */
    readonly coveredStatements: number;
    /**
     * Boolean flag indicating whether the run produced zero executable
     * coverage.
     */
    readonly isZeroCoverage: boolean;
}

/**
 * Structured result describing the evaluation of a single test file.
 */
interface EvaluationResult {
    /** Absolute path to the test file. */
    readonly testFile: string;
    /** Coverage information collected during execution. */
    readonly summary: CoverageSummary;
}

/**
 * Parses incoming CLI arguments into strongly typed options.
 *
 * @param argv - Raw arguments passed to the process after the executable name.
 *
 * @returns Normalized CLI options used throughout the script.
 */
function parseCliArguments(argv: readonly string[]): CliOptions {
    const explicitFiles: string[] = [];
    let configPath: string | null = ZERO_COVERAGE_CONFIG_PATH;
    let filePattern: RegExp | null = null;
    let maxFiles: number | null = null;
    let dryRun = false;
    let keepReports = false;
    let timeoutMs = DEFAULT_TIMEOUT_MS;

    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];
        switch (token) {
            case "--config": {
                configPath = argv[index + 1] ?? null;
                index += 1;
                break;
            }
            case "--pattern": {
                const patternValue = argv[index + 1];
                if (!patternValue) {
                    throw new Error("--pattern expects a value");
                }
                filePattern = new RegExp(patternValue, "i");
                index += 1;
                break;
            }
            case "--max-files": {
                const rawValue = argv[index + 1];
                if (!rawValue) {
                    throw new Error("--max-files expects a numeric value");
                }
                const parsed = Number.parseInt(rawValue, 10);
                if (Number.isNaN(parsed) || parsed <= 0) {
                    throw new Error("--max-files must be a positive integer");
                }
                maxFiles = parsed;
                index += 1;
                break;
            }
            case "--dry-run": {
                dryRun = true;
                break;
            }
            case "--keep-reports": {
                keepReports = true;
                break;
            }
            case "--timeout-ms": {
                const rawValue = argv[index + 1];
                if (!rawValue) {
                    throw new Error("--timeout-ms expects a numeric value");
                }
                const parsed = Number.parseInt(rawValue, 10);
                if (Number.isNaN(parsed) || parsed <= 0) {
                    throw new Error("--timeout-ms must be a positive integer");
                }
                timeoutMs = parsed;
                index += 1;
                break;
            }
            default: {
                if (token !== undefined) {
                    if (token.startsWith("-")) {
                        throw new Error(`Unknown flag: ${token}`);
                    }
                    explicitFiles.push(token);
                }
            }
        }
    }

    return {
        configPath,
        filePattern,
        maxFiles,
        dryRun,
        keepReports,
        cwd: process.cwd(),
        explicitFiles,
        timeoutMs,
    };
}

/**
 * Collects Vitest test files using the `vitest list` command.
 *
 * @param options - Parsed CLI options controlling the listing phase.
 *
 * @returns Absolute paths for every test file matching the criteria.
 */
async function collectTestFiles(
    options: CliOptions
): Promise<readonly string[]> {
    console.log(
        `[collectTestFiles] Starting collection with options: ${JSON.stringify({ ...options, cwd: "[redacted]" })}`
    );
    if (options.explicitFiles.length > 0) {
        const resolved = options.explicitFiles.map((file) =>
            path.resolve(options.cwd, file));
        console.log(
            `[collectTestFiles] Using explicit files: ${resolved.length}`
        );
        return resolved;
    }

    // Check if the config file exists; if not, warn and disable it to prevent hangs
    let effectiveConfigPath = options.configPath;
    if (effectiveConfigPath) {
        try {
            await access(effectiveConfigPath);
        } catch {
            console.warn(
                `[collectTestFiles] Config file '${effectiveConfigPath}' does not exist. Proceeding without --config.`
            );
            effectiveConfigPath = null;
        }
    }

    const listingRoot = await mkdtemp(path.join(tmpdir(), "vitest-list-"));
    const listingFile = path.join(listingRoot, "test-files.json");

    const args = [
        "list",
        "--filesOnly",
        `--json=${listingFile}`,
        "--silent",
    ];
    if (effectiveConfigPath) {
        args.push("--config", effectiveConfigPath);
    }

    let candidateFiles: string[] = [];
    try {
        console.log(`[collectTestFiles] Running vitest list command`);
        await runVitestCommand(options.cwd, args, options.timeoutMs);

        const rawListing = await readFile(listingFile, "utf8");
        const parsed = JSON.parse(rawListing) as Array<
            string | { file: string }
        >;
        candidateFiles = parsed.map((entry) => {
            if (typeof entry === "string") {
                return path.resolve(options.cwd, entry);
            }

            if (entry && typeof entry.file === "string") {
                return path.resolve(options.cwd, entry.file);
            }

            throw new Error(
                `Unexpected test listing entry: ${JSON.stringify(entry, null, 2)}`
            );
        });
        console.log(
            `[collectTestFiles] Parsed ${candidateFiles.length} candidate files`
        );
    } finally {
        await rm(listingRoot, { recursive: true, force: true });
    }

    const filtered = options.filePattern
        ? candidateFiles.filter((file) => options.filePattern?.test(file))
        : candidateFiles;

    if (options.maxFiles !== null) {
        return filtered.slice(0, options.maxFiles);
    }

    console.log(`[collectTestFiles] Filtered to ${filtered.length} files`);
    return filtered;
}

/**
 * Executes a single test file with coverage enabled and analyzes the output.
 *
 * @param testFile - Test file to run.
 * @param options - CLI options controlling execution behaviour.
 * @param reportDir - Directory used to persist intermediate coverage reports.
 *
 * @returns Structured coverage summary for the executed test file.
 */
async function evaluateTestFile(
    testFile: string,
    options: CliOptions,
    reportDir: string
): Promise<EvaluationResult> {
    console.log(`[evaluateTestFile] Starting evaluation for ${testFile}`);
    const reportFile = path.join(reportDir, `${randomUUID()}.json`);
    const args = [
        "run",
        testFile,
        "--coverage",
        "--reporter=json",
        `--outputFile=${reportFile}`,
        "--silent",
    ];

    // Check if the config file exists; if not, warn and disable it to prevent hangs
    let effectiveConfigPath = options.configPath;
    if (effectiveConfigPath) {
        try {
            await access(effectiveConfigPath);
        } catch {
            console.warn(
                `[evaluateTestFile] Config file '${effectiveConfigPath}' does not exist. Proceeding without --config.`
            );
            effectiveConfigPath = null;
        }
    }

    if (effectiveConfigPath) {
        args.push("--config", effectiveConfigPath);
    }

    await runVitestCommand(options.cwd, args, options.timeoutMs);

    const rawReport = await readFile(reportFile, "utf8");
    const parsedReport = JSON.parse(rawReport) as {
        coverageMap?: CoverageMapData;
    };
    const coverageMap = createCoverageMap(parsedReport.coverageMap ?? {});

    const instrumentedFiles = coverageMap.files();

    const coverageSummary = coverageMap.getCoverageSummary();
    const coveredStatements = coverageSummary.statements.covered;
    const isZeroCoverage =
        instrumentedFiles.length === 0 ||
        [
            coverageSummary.statements.covered,
            coverageSummary.branches.covered,
            coverageSummary.functions.covered,
            coverageSummary.lines.covered,
        ].every((metric) => metric === 0);

    if (!options.keepReports) {
        await rm(reportFile, { force: true });
    }

    const evaluation = {
        testFile,
        summary: {
            instrumentedFiles,
            coveredStatements,
            isZeroCoverage,
        },
    };
    console.log(
        `[evaluateTestFile] Completed evaluation for ${testFile}: ${evaluation.summary.isZeroCoverage ? "zero coverage" : `${evaluation.summary.coveredStatements} statements`}`
    );
    return evaluation;
}

/**
 * Ensures the temporary reporting directory exists and is ready for use.
 *
 * @param keepReports - Whether the directory should be preserved between runs.
 *
 * @returns Absolute path to the directory prepared for coverage artifacts.
 */
async function prepareReportDirectory(keepReports: boolean): Promise<string> {
    if (keepReports) {
        const persistentDir = path.resolve(
            process.cwd(),
            "coverage",
            "zero-coverage-reports"
        );
        await mkdir(persistentDir, { recursive: true });
        return persistentDir;
    }

    const transientDir = await mkdtemp(
        path.join(tmpdir(), "vitest-zero-coverage-")
    );
    return transientDir;
}

/**
 * Main entry point coordinating argument parsing, discovery, execution, and
 * reporting.
 */
/* eslint-disable-next-line unicorn/prefer-top-level-await */
void (async () => {
    console.log(`[main] Script started at ${new Date().toISOString()}`);
    let options: CliOptions | null = null;
    let reportDir: string | null = null;
    let exitCode = 0;
    try {
        console.log(`[main] Parsing CLI arguments`);
        options = parseCliArguments(process.argv.slice(2));
        console.log(
            `[main] Options parsed: ${JSON.stringify({ ...options, cwd: "[redacted]" })}`
        );

        console.log(`[main] Collecting test files`);
        const testFiles = await collectTestFiles(options);
        if (testFiles.length === 0) {
            console.warn("No test files found using the provided filters.");
            return;
        }
        console.log(`[main] Collected ${testFiles.length} test files`);

        if (options.dryRun) {
            console.log("Discovered test files:");
            for (const file of testFiles) {
                console.log(` - ${path.relative(options.cwd, file)}`);
            }
            return;
        }

        const reportDirectory = await prepareReportDirectory(
            options.keepReports
        );
        reportDir = reportDirectory;
        const results: EvaluationResult[] = [];
        for (const file of testFiles) {
            process.stdout.write(
                `Analyzing ${path.relative(options.cwd, file)}... `
            );
            try {
                const evaluation = await evaluateTestFile(
                    file,
                    options,
                    reportDirectory
                );
                results.push(evaluation);
                console.log(
                    evaluation.summary.isZeroCoverage
                        ? "no coverage"
                        : `${evaluation.summary.coveredStatements} statements covered`
                );
            } catch (error) {
                console.error(`[main] Evaluation failed for ${file}`);
                throw error;
            }
        }

        const zeroCoverage = results.filter(
            (result) => result.summary.isZeroCoverage
        );
        const covered = results.filter(
            (result) => !result.summary.isZeroCoverage
        );

        console.log("\n=== Coverage Audit Summary ===");
        console.log(`Inspected ${results.length} test file(s).`);
        console.log(` - ${covered.length} file(s) executed executable code.`);
        console.log(
            ` - ${zeroCoverage.length} file(s) produced zero coverage.`
        );

        if (zeroCoverage.length > 0) {
            console.log("\nCandidates for removal / refactoring:");
            for (const result of zeroCoverage) {
                console.log(
                    ` - ${path.relative(options.cwd, result.testFile)}`
                );
            }
        }

        if (covered.length > 0) {
            console.log("\nFiles that exercised code (top 5 by statements):");
            const topCovered = covered
                .toSorted(
                    (a, b) =>
                        b.summary.coveredStatements -
                        a.summary.coveredStatements
                )
                .slice(0, 5);
            for (const result of topCovered) {
                console.log(
                    ` - ${path.relative(options.cwd, result.testFile)} (${result.summary.coveredStatements} statements)`
                );
            }
        }
    } catch (error) {
        console.error(
            `[main] Script failed: ${error instanceof Error ? (error.stack ?? error.message) : error}`
        );
        exitCode = 1;
    } finally {
        if (reportDir && options && !options.keepReports) {
            await rm(reportDir, { recursive: true, force: true });
        }
        if (exitCode !== 0) {
            process.exit(exitCode);
        }
    }
})();
