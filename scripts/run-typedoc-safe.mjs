import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const repositoryRootPath = path.resolve(import.meta.dirname, "..");
const docusaurusWorkspacePath = path.join(
    repositoryRootPath,
    "docs",
    "docusaurus"
);

const windowsSafePathProblemCharacters = [
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
];

/**
 * Print usage information.
 *
 * @returns {void}
 */
function showHelp() {
    console.log(`
Usage: node scripts/run-typedoc-safe.mjs <typedoc-config-path> [...typedocArgs]

Options:
  --help, -h    Show this help message

Examples:
  node scripts/run-typedoc-safe.mjs docs/docusaurus/typedoc.config.json
  node scripts/run-typedoc-safe.mjs docs/docusaurus/typedoc.local.config.json --dryRun
`);
}

/**
 * Resolve and validate CLI arguments for the TypeDoc wrapper.
 *
 * @param {string[]} args - Raw command line arguments.
 *
 * @returns {{
 *     additionalArguments: string[];
 *     help: boolean;
 *     resolvedConfigPath: string;
 * }}
 *   Parsed options.
 */
function parseArgs(args) {
    if (args.includes("--help") || args.includes("-h")) {
        showHelp();
        return {
            additionalArguments: [],
            help: true,
            resolvedConfigPath: "",
        };
    }

    const [configPathFromRepositoryRoot, ...additionalArguments] = args;
    if (!configPathFromRepositoryRoot) {
        throw new Error(
            "Missing TypeDoc config path. Run with --help for usage."
        );
    }

    if (configPathFromRepositoryRoot.startsWith("-")) {
        throw new Error(
            "TypeDoc config path must be provided before TypeDoc arguments."
        );
    }

    const resolvedConfigPath = path.resolve(
        repositoryRootPath,
        configPathFromRepositoryRoot
    );

    const relativeConfigPath = path.relative(
        repositoryRootPath,
        resolvedConfigPath
    );
    if (
        relativeConfigPath === "" ||
        relativeConfigPath.startsWith("..") ||
        path.isAbsolute(relativeConfigPath)
    ) {
        throw new Error(
            `TypeDoc config path must stay inside the repository: ${resolvedConfigPath}`
        );
    }

    if (!existsSync(resolvedConfigPath)) {
        throw new Error(`TypeDoc config not found: ${resolvedConfigPath}`);
    }

    return {
        additionalArguments,
        help: false,
        resolvedConfigPath,
    };
}

function resolveNpmInvocation() {
    const execPathCandidate = process.env["npm_execpath"];

    if (typeof execPathCandidate === "string" && execPathCandidate !== "") {
        return {
            argsPrefix: [execPathCandidate],
            command: process.execPath,
        };
    }

    const bundledCliPath = path.join(
        path.dirname(process.execPath),
        "node_modules",
        "npm",
        "bin",
        "npm-cli.js"
    );

    if (existsSync(bundledCliPath)) {
        return {
            argsPrefix: [bundledCliPath],
            command: process.execPath,
        };
    }

    return {
        argsPrefix: [],
        command: process.platform === "win32" ? "npm.cmd" : "npm",
    };
}

/**
 * Run TypeDoc through npm with a Windows-safe path workaround when needed.
 *
 * @param {string[]} [args] - Raw command line arguments.
 *
 * @returns {number} Process exit code.
 */
function main(args = process.argv.slice(2)) {
    let parsedArguments;
    try {
        parsedArguments = parseArgs(args);
    } catch (error) {
        console.error(
            "❌ Error:",
            error instanceof Error ? error.message : String(error)
        );
        return 1;
    }

    if (parsedArguments.help) {
        return 0;
    }

    const { additionalArguments, resolvedConfigPath } = parsedArguments;
    const npmInvocation = resolveNpmInvocation();

    const requiresWindowsSafePath =
        process.platform === "win32" &&
        windowsSafePathProblemCharacters.some((character) =>
            repositoryRootPath.includes(character)
        );

    let temporaryDirectoryPath = "";
    let executionRootPath = repositoryRootPath;

    try {
        if (requiresWindowsSafePath) {
            temporaryDirectoryPath = mkdtempSync(
                path.join(tmpdir(), "uw-typedoc-")
            );
            executionRootPath = path.join(temporaryDirectoryPath, "repo");

            symlinkSync(repositoryRootPath, executionRootPath, "junction");

            console.warn(
                `[TypeDoc] Using Windows-safe junction path: ${executionRootPath}`
            );
        }

        const result = spawnSync(
            npmInvocation.command,
            [
                ...npmInvocation.argsPrefix,
                "exec",
                "--",
                "typedoc",
                "--options",
                path.relative(docusaurusWorkspacePath, resolvedConfigPath),
                ...additionalArguments,
            ],
            {
                cwd: path.join(executionRootPath, "docs", "docusaurus"),
                env: process.env,
                stdio: "inherit",
            }
        );

        if (result.error) {
            throw result.error;
        }

        return result.status ?? 1;
    } catch (error) {
        console.error(
            "❌ Error:",
            error instanceof Error ? error.message : String(error)
        );
        return 1;
    } finally {
        if (temporaryDirectoryPath) {
            rmSync(temporaryDirectoryPath, { force: true, recursive: true });
        }
    }
}

/**
 * @returns {boolean} `true` when this file is the CLI entrypoint.
 */
function isDirectRun() {
    return (
        typeof process.argv[1] === "string" &&
        import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
    );
}

if (isDirectRun()) {
    process.exitCode = main();
}

export { isDirectRun, main, parseArgs, resolveNpmInvocation };
