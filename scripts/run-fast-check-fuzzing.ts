/**
 * CLI utility for executing all fast-check fuzzing suites with a custom run
 * count.
 *
 * @remarks
 * This script allows developers to execute only the property-based tests while
 * overriding the `FAST_CHECK_NUM_RUNS` (and optionally the seed) environment
 * variables, without touching the rest of the Vitest suites. By default it
 * mirrors the behaviour of `npm run fuzz:all` but enables fine-grained control
 * over run counts and additional Vitest CLI flags.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

type MutableProcessEnv = Record<string, string | undefined>;

/** Supported fuzzing targets that can be invoked by the script. */
type FuzzTarget = "base" | "electron" | "shared";

const TARGET_TO_SCRIPT: Record<FuzzTarget, string> = {
    base: "fuzz",
    electron: "fuzz:electron",
    shared: "fuzz:shared",
} as const;

const DEFAULT_TARGETS: readonly FuzzTarget[] = [
    "base",
    "electron",
    "shared",
];

interface NpmInvocation {
    readonly command: string;
    readonly argsPrefix: readonly string[];
}

const npmInvocation: NpmInvocation = (() => {
    const execPathCandidate = process.env.npm_execpath;
    if (typeof execPathCandidate === "string" && execPathCandidate !== "") {
        return {
            command: process.execPath,
            argsPrefix: [execPathCandidate],
        } satisfies NpmInvocation;
    }

    const bundledCli = path.join(
        path.dirname(process.execPath),
        "node_modules",
        "npm",
        "bin",
        "npm-cli.js"
    );

    if (existsSync(bundledCli)) {
        return {
            command: process.execPath,
            argsPrefix: [bundledCli],
        } satisfies NpmInvocation;
    }

    return {
        command: process.platform === "win32" ? "npm.cmd" : "npm",
        argsPrefix: [],
    } satisfies NpmInvocation;
})();

/**
 * Parsed command-line arguments understood by the fuzzing runner script.
 */
interface CliOptions {
    /** Desired number of fast-check runs per property. */
    readonly runs: number;
    /** Optional deterministic seed forwarded to fast-check. */
    readonly seed?: number;
    /** Collection of fuzzing targets to execute, defaults to all. */
    readonly targets: readonly FuzzTarget[];
    /** Additional arguments forwarded to the underlying Vitest invocation. */
    readonly passthroughArgs: readonly string[];
}

/**
 * Human-friendly error type for invalid CLI usage.
 */
class CliUsageError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = "CliUsageError";
    }
}

/**
 * Parses `process.argv` into structured options.
 *
 * @param argv - Raw argument vector from Node.js.
 *
 * @returns Parsed options that drive the fuzzing run.
 *
 * @throws {CliUsageError} When required arguments are missing or invalid.
 */
function parseCliOptions(argv: readonly string[]): CliOptions {
    const delimiterIndex = argv.indexOf("--");
    let optionArgs: readonly string[];
    let passthroughArgs: readonly string[];

    if (delimiterIndex === -1) {
        optionArgs = argv;
        passthroughArgs = [];
    } else {
        optionArgs = argv.slice(0, delimiterIndex);
        passthroughArgs = argv.slice(delimiterIndex + 1);
    }

    let runs: number | undefined;
    let seed: number | undefined;
    let targets: readonly FuzzTarget[] | undefined;

    const normalizedTargets = new Set<FuzzTarget>();

    const applyTargets = (rawTargets: string) => {
        for (const entry of rawTargets.split(",")) {
            const normalized = entry.trim().toLowerCase();
            if (normalized === "" || normalized === "all") {
                continue;
            }

            if ((TARGET_TO_SCRIPT as Record<string, string>)[normalized]) {
                normalizedTargets.add(normalized as FuzzTarget);
            } else {
                throw new CliUsageError(
                    `Unknown fuzzing target '${entry}'. Expected one of: ${Object.keys(TARGET_TO_SCRIPT).join(", ")}, or 'all'.`
                );
            }
        }
    };

    for (let index = 0; index < optionArgs.length; index += 1) {
        const argument = optionArgs[index] ?? "";

        if (argument === "--runs" || argument === "-r") {
            const next = optionArgs[index + 1];
            if (typeof next !== "string") {
                throw new CliUsageError("Missing value after --runs option.");
            }
            runs = parsePositiveInteger(next, "--runs");
            index += 1;
            continue;
        }

        if (argument.startsWith("--runs=")) {
            runs = parsePositiveInteger(
                argument.split("=", 2)[1] ?? "",
                "--runs"
            );
            continue;
        }

        if (/^\d+$/.test(argument) && runs === undefined) {
            runs = parsePositiveInteger(argument, "runs");
            continue;
        }

        if (argument === "--seed" || argument === "-s") {
            const next = optionArgs[index + 1];
            if (typeof next !== "string") {
                throw new CliUsageError("Missing value after --seed option.");
            }
            seed = parseInteger(next, "--seed");
            index += 1;
            continue;
        }

        if (argument.startsWith("--seed=")) {
            seed = parseInteger(argument.split("=", 2)[1] ?? "", "--seed");
            continue;
        }

        if (argument === "--targets" || argument === "-t") {
            const next = optionArgs[index + 1];
            if (typeof next !== "string") {
                throw new CliUsageError(
                    "Missing value after --targets option."
                );
            }
            applyTargets(next);
            index += 1;
            continue;
        }

        if (argument.startsWith("--targets=")) {
            applyTargets(argument.split("=", 2)[1] ?? "");
            continue;
        }

        if (argument.toLowerCase() === "--all") {
            normalizedTargets.clear();
            targets = DEFAULT_TARGETS;
            continue;
        }

        throw new CliUsageError(`Unrecognised argument '${argument}'.`);
    }

    if (runs === undefined) {
        throw new CliUsageError(
            "--runs <positive number> is required (or provide the value as the first positional argument)."
        );
    }

    if (targets === undefined) {
        targets =
            normalizedTargets.size > 0
                ? Array.from(normalizedTargets)
                : DEFAULT_TARGETS;
    }

    return {
        runs,
        seed,
        targets,
        passthroughArgs,
    };
}

/**
 * Parses a strictly positive integer.
 *
 * @param value - Raw string value to parse.
 * @param label - Name of the option for error reporting.
 */
function parsePositiveInteger(value: string, label: string): number {
    const parsed = parseInteger(value, label);
    if (!(parsed > 0)) {
        throw new CliUsageError(`${label} must be a positive integer.`);
    }
    return parsed;
}

/**
 * Parses an integer value used by the CLI options.
 *
 * @param value - Raw string value to parse.
 * @param label - Name of the option for error reporting.
 */
function parseInteger(value: string, label: string): number {
    const parsed = Number.parseInt(value.trim(), 10);
    if (!Number.isFinite(parsed)) {
        throw new CliUsageError(
            `${label} must be an integer; received '${value}'.`
        );
    }
    return Math.trunc(parsed);
}

/**
 * Runs an npm script in a child process while inheriting stdio.
 *
 * @param script - Npm script name to execute.
 * @param env - Environment variables to provide to the child process.
 * @param extraArgs - Additional arguments forwarded to the script (after an npm
 *   `--`).
 */
function runNpmScript(
    script: string,
    env: MutableProcessEnv,
    extraArgs: readonly string[]
): Promise<void> {
    return new Promise((resolve, reject) => {
        const args = [
            ...npmInvocation.argsPrefix,
            "run",
            script,
        ];
        if (extraArgs.length > 0) {
            args.push("--", ...extraArgs);
        }

        const child = spawn(npmInvocation.command, args, {
            stdio: "inherit",
            env,
        });

        child.on("error", reject);
        child.on("exit", (code, signal) => {
            if (code === 0) {
                resolve();
                return;
            }

            const reason =
                signal === null
                    ? `exited with code ${code}`
                    : `terminated by signal ${signal}`;
            reject(
                new Error(
                    `npm run ${script} ${reason}. Use --runs to control retry count and --targets to limit execution.`
                )
            );
        });
    });
}

/**
 * Entry point for the CLI script.
 */
async function main(): Promise<void> {
    try {
        const options = parseCliOptions(process.argv.slice(2));
        const childEnv: MutableProcessEnv = {
            ...process.env,
            FAST_CHECK_NUM_RUNS: String(options.runs),
        };

        if (options.seed === undefined) {
            delete childEnv.FAST_CHECK_SEED;
        } else {
            childEnv.FAST_CHECK_SEED = String(options.seed);
        }

        for (const target of options.targets) {
            const script = TARGET_TO_SCRIPT[target];
            console.log(
                `\n[fast-check] Running '${script}' with FAST_CHECK_NUM_RUNS=${childEnv.FAST_CHECK_NUM_RUNS}${childEnv.FAST_CHECK_SEED ? ` and FAST_CHECK_SEED=${childEnv.FAST_CHECK_SEED}` : ""}...`
            );
            await runNpmScript(script, childEnv, options.passthroughArgs);
        }

        console.log(
            "\n[fast-check] All requested fuzzing suites completed successfully."
        );
    } catch (error) {
        if (error instanceof CliUsageError) {
            console.error(`[fast-check] ${error.message}`);
        } else {
            console.error("[fast-check] Unexpected error:", error);
        }
        process.exitCode = 1;
    }
}

void main(); // eslint-disable-line unicorn/prefer-top-level-await -- CommonJS entrypoints cannot use top-level await reliably across tooling
