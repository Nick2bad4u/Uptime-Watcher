#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";

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

const childProcess = spawn(process.execPath, [cliEntryPoint, ...runnerArguments], {
    shell: false,
    stdio: "inherit",
});

childProcess.on("exit", (code, signal) => {
    if (typeof code === "number") {
        if (code === 1 && allowEmpty) {
            process.exit(0);
            return;
        }

        process.exit(code);
        return;
    }

    if (signal) {
        process.kill(process.pid, signal);
        return;
    }

    process.exit(0);
});
