#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";

const cliEntryPoint = path.resolve(
    import.meta.dirname,
    "..",
    "node_modules",
    "@storybook",
    "test-runner",
    "dist",
    "test-storybook.js"
);

const runnerArguments = process.argv.slice(2);
const allowEmptyIndex = runnerArguments.indexOf("--allow-empty");
const allowEmpty = allowEmptyIndex !== -1;

if (allowEmpty) {
    runnerArguments.splice(allowEmptyIndex, 1);
}

const localStorageDir = path.join(tmpdir(), "uptime-watcher", "storybook");
const localStorageFile = path.join(
    localStorageDir,
    "test-runner-localstorage.json"
);

if (!existsSync(localStorageDir)) {
    mkdirSync(localStorageDir, { recursive: true });
}

const nodeArguments = [cliEntryPoint, ...runnerArguments];

const existingNodeOptions = process.env["NODE_OPTIONS"] ?? "";
const escapedLocalStoragePath = localStorageFile.replaceAll("\\", "\\\\");
const localStorageOption = `--localstorage-file=${escapedLocalStoragePath}`;
const hasLocalStorageOption = existingNodeOptions.includes(
    "--localstorage-file"
);

const mergedNodeOptions = hasLocalStorageOption
    ? existingNodeOptions
    : [existingNodeOptions, localStorageOption]
          .filter((value) => value.trim().length > 0)
          .join(" ");

const childProcess = spawn(process.execPath, nodeArguments, {
    env: {
        ...process.env,
        NODE_OPTIONS: mergedNodeOptions,
    },
    shell: false,
    stdio: "inherit",
});

childProcess.on("exit", (code, signal) => {
    if (typeof code === "number") {
        if (code === 1 && allowEmpty) {
            process.exit(0);
        }

        process.exit(code);
    }

    if (signal) {
        process.kill(process.pid, signal);
    }

    process.exit(0);
});
