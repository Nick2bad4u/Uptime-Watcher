import * as fs from "node:fs";
import * as path from "node:path";

const fileConfigs = [
    {
        file: "benchmarks/services/configurationManagement.bench.ts",
        domain: "configuration management benchmark",
    },
    {
        file: "benchmarks/services/dnsMonitoring.bench.ts",
        domain: "DNS monitoring benchmark",
    },
    {
        file: "benchmarks/services/eventProcessing.bench.ts",
        domain: "event processing benchmark",
    },
    {
        file: "benchmarks/services/fileManagement.bench.ts",
        domain: "file management benchmark",
    },
    {
        file: "benchmarks/services/monitorServiceManagement.bench.ts",
        domain: "monitor service management benchmark",
    },
    {
        file: "benchmarks/services/siteManagement.bench.ts",
        domain: "site management benchmark",
    },
    {
        file: "benchmarks/services/statusProcessing.bench.ts",
        domain: "status processing benchmark",
    },
];

const workspaceRoot = process.cwd();

for (const config of fileConfigs) {
    const absPath = path.join(workspaceRoot, config.file);
    const original = fs.readFileSync(absPath, "utf8");
    const updated = updateFile(original, config);
    if (updated !== original) {
        fs.writeFileSync(absPath, updated, "utf8");
    }
}

/**
 * @param {string} text
 * @param {{ file: string; domain: string }} config
 */
function updateFile(text, config) {
    let result = updateHeader(text, config);
    result = addDocToDefinitions(result, config);
    result = addDocToFunctions(result, config);
    return result;
}

/**
 * @param {string} text
 * @param {{ file: string; domain: any }} config
 */
function updateHeader(text, config) {
    const title = buildTitle(config.file);
    const description = `Exercises ${config.domain} scenarios to measure service throughput and resilience.`;
    const header = [
        "/**",
        ` * ${title}.`,
        " *",
        " * @packageDocumentation",
        " *",
        ` * ${description}`,
        " */",
        "",
    ].join("\n");

    if (text.startsWith("/**")) {
        const end = text.indexOf("*/");
        const remainder = text.slice(end + 2).replace(/^\s*\n*/, "");
        return `${header}${remainder.startsWith("\n") ? remainder : `\n${remainder}`}`;
    }

    return `${header}\n${text}`;
}

/**
 * @param {string} text
 * @param {{ domain: string }} config
 */
function addDocToDefinitions(text, config) {
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const match = line.match(
            /^(?<indent>\s*)(?:export\s+)?(?<kind>interface|class|type)\s+(?<name>\w+)/
        );
        if (!match) continue;

        const indent = match.groups?.["indent"] ?? "";
        const kind = match.groups?.["kind"] ?? "interface";
        const name = match.groups?.["name"] ?? "";
        const prevLine = lines[i - 1]?.trim();

        if (prevLine && prevLine.startsWith("/**")) {
            continue;
        }

        // Validate kind is one of the expected values
        if (kind !== "interface" && kind !== "class" && kind !== "type") {
            continue;
        }

        const commentLines = buildDefinitionComment(
            indent,
            kind,
            name,
            config.domain
        );
        lines.splice(i, 0, ...commentLines);
        i += commentLines.length;
    }

    return lines.join("\n");
}

/**
 * @param {string} text
 * @param {{ domain: string }} config
 */
function addDocToFunctions(text, config) {
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const match = line.match(/^(?<indent>\s*)function\s+(?<name>\w+)\s*\(/);
        if (!match) continue;

        const indent = match.groups?.["indent"] ?? "";
        const name = match.groups?.["name"] ?? "";
        const prevLine = lines[i - 1]?.trim();

        if (prevLine && prevLine.startsWith("/**")) {
            continue;
        }

        const commentLines = buildFunctionComment(indent, name, config.domain);
        lines.splice(i, 0, ...commentLines);
        i += commentLines.length;
    }

    return lines.join("\n");
}

/**
 * @param {string} indent
 * @param {"interface" | "class" | "type"} kind
 * @param {string} name
 * @param {string} domain
 */
function buildDefinitionComment(indent, kind, name, domain) {
    const baseName = name.startsWith("Mock") ? name.slice(4) : name;
    const words = toWords(baseName);

    let sentence;
    switch (kind) {
        case "interface": {
            sentence = `Represents ${words} data in the ${domain}.`;
            break;
        }
        case "class": {
            sentence = name.startsWith("Mock")
                ? `Mock ${words} used to drive the ${domain}.`
                : `Implements ${words} behaviour for the ${domain}.`;
            break;
        }
        case "type": {
            sentence = `Utility type describing ${words} for the ${domain}.`;
            break;
        }
        default: {
            sentence = `Helper definition used in the ${domain}.`;
        }
    }

    return [
        `${indent}/**`,
        `${indent} * ${sentence}`,
        `${indent} */`,
    ];
}

/**
 * @param {string} indent
 * @param {string} name
 * @param {string} domain
 */
function buildFunctionComment(indent, name, domain) {
    const baseName = name
        .replace(/^create/i, "")
        .replace(/^generate/i, "")
        .replace(/^build/i, "")
        .replace(/^make/i, "");
    const words = toWords(baseName || name);
    const sentence = `Creates ${words} for the ${domain}.`;

    return [
        `${indent}/**`,
        `${indent} * ${sentence}`,
        `${indent} */`,
    ];
}

/**
 * @param {string} name
 */
function toWords(name) {
    return name
        .replaceAll(/(?<lower>[\da-z])(?<upper>[A-Z])/g, "$<lower> $<upper>")
        .replaceAll("_", " ")
        .trim()
        .toLowerCase();
}

/**
 * @param {string} filePath
 */
function buildTitle(filePath) {
    const base = path.basename(filePath).replace(/\.bench\.ts$/, "");
    const words = base
        .replaceAll(/(?<lower>[\da-z])(?<upper>[A-Z])/g, "$<lower> $<upper>")
        .replaceAll("-", " ")
        .replaceAll("_", " ")
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");

    return `${words} Benchmarks`;
}
