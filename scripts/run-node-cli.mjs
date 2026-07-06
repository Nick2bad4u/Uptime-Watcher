#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import process from "node:process";

const ENV_ASSIGNMENT_PATTERN = /^[A-Z_][A-Z0-9_]*=/u;

if (process.env.NO_COLOR && process.env.FORCE_COLOR) {
    Reflect.deleteProperty(process.env, "FORCE_COLOR");
}

function showUsage() {
    console.error(
        "Usage: node scripts/run-node-cli.mjs [NAME=value ...] [--] <command> [...args]"
    );
}

function parseArguments(rawArguments) {
    const envAssignments = {};
    let commandIndex = 0;

    for (; commandIndex < rawArguments.length; commandIndex += 1) {
        const argument = rawArguments[commandIndex];

        if (argument === "--") {
            commandIndex += 1;
            break;
        }

        if (!argument || !ENV_ASSIGNMENT_PATTERN.test(argument)) {
            break;
        }

        const separatorIndex = argument.indexOf("=");
        envAssignments[argument.slice(0, separatorIndex)] = argument.slice(
            separatorIndex + 1
        );
    }

    const [command, ...commandArguments] = rawArguments.slice(commandIndex);

    return {
        command,
        commandArguments,
        envAssignments,
    };
}

function buildEnvironment(envAssignments, baseEnvironment = process.env) {
    const environment = { ...baseEnvironment };

    for (const [name, value] of Object.entries(envAssignments)) {
        if (value === "") {
            Reflect.deleteProperty(environment, name);
        } else {
            environment[name] = value;
        }
    }

    if (environment.NO_COLOR && environment.FORCE_COLOR) {
        Reflect.deleteProperty(environment, "FORCE_COLOR");
    }

    return environment;
}

function quoteWindowsCommandArgument(argument) {
    if (argument === "") {
        return '""';
    }

    if (!/[\s"&|<>()^%!]/u.test(argument)) {
        return argument;
    }

    return `"${argument
        .replace(/(\\*)"/gu, '$1$1\\"')
        .replace(/(\\+)$/u, "$1$1")
        .replaceAll("%", "%%")}"`;
}

function buildWindowsCommandLine(command, commandArguments) {
    return [command, ...commandArguments]
        .map((argument) => quoteWindowsCommandArgument(argument))
        .join(" ");
}

function runCommand(command, commandArguments, environment) {
    if (process.platform === "win32") {
        return spawnSync(buildWindowsCommandLine(command, commandArguments), {
            env: environment,
            shell: process.env.ComSpec ?? true,
            stdio: "inherit",
            windowsHide: true,
        });
    }

    return spawnSync(command, commandArguments, {
        env: environment,
        stdio: "inherit",
    });
}

function main(rawArguments = process.argv.slice(2)) {
    const { command, commandArguments, envAssignments } =
        parseArguments(rawArguments);

    if (!command) {
        showUsage();
        return 1;
    }

    const result = runCommand(
        command,
        commandArguments,
        buildEnvironment(envAssignments)
    );

    if (result.error) {
        console.error(
            `Failed to run ${command}:`,
            result.error instanceof Error ? result.error.message : result.error
        );
        return 1;
    }

    return result.status ?? 1;
}

process.exitCode = main();

export {
    buildEnvironment,
    buildWindowsCommandLine,
    main,
    parseArguments,
    quoteWindowsCommandArgument,
    runCommand,
};
