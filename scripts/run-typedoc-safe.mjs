import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";
import process from "node:process";

const repositoryRootPath = path.resolve(import.meta.dirname, "..");
const docusaurusWorkspacePath = path.join(
    repositoryRootPath,
    "docs",
    "docusaurus"
);
const configPathFromRepositoryRoot = process.argv[2];
const additionalArguments = process.argv.slice(3);

const windowsSafePathProblemCharacters = [
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
];

const npmInvocation = (() => {
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
})();

if (!configPathFromRepositoryRoot) {
    console.error(
        "Usage: node scripts/run-typedoc-safe.mjs <typedoc-config-path> [...typedocArgs]"
    );
    process.exit(1);
}

const resolvedConfigPath = path.resolve(
    repositoryRootPath,
    configPathFromRepositoryRoot
);

if (!existsSync(resolvedConfigPath)) {
    console.error(`TypeDoc config not found: ${resolvedConfigPath}`);
    process.exit(1);
}

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

    process.exit(result.status ?? 1);
} finally {
    if (temporaryDirectoryPath) {
        rmSync(temporaryDirectoryPath, { force: true, recursive: true });
    }
}
