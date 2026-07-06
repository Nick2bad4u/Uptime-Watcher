/**
 * IPC Channel Analysis Tool for Preload Refactoring
 *
 * @remarks
 * This tool analyzes the domain-specific IPC handler modules to extract all
 * channel definitions and automatically generates domain mappings for the
 * modular preload architecture. It keeps backend IPC handlers aligned with
 * frontend API methods.
 *
 * @packageDocumentation
 */

import {
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    writeFileSync,
} from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Represents an IPC channel definition extracted from the backend
 */
export interface IpcChannelDefinition {
    /** The channel name used in ipcMain.handle/ipcRenderer.invoke */
    channel: string;
    /** The domain this channel belongs to (sites, monitoring, data, etc.) */
    domain: string;
    /** The method name to use in the API (derived from channel name) */
    methodName: string;
    /** Whether this channel requires parameters */
    hasParameters: boolean;
    /** The validator function name used for this channel */
    validator: string | null;
    /** Return type information if available */
    returnType: string;
    /** Original handler method for reference */
    handlerMethod: string;
    /** Source file where the channel is registered */
    sourceFile: string;
}

/**
 * Grouped channel definitions by domain
 */
export interface DomainChannelMap {
    [domain: string]: IpcChannelDefinition[];
}

/**
 * Analyzes IPC handler modules to extract all channel definitions.
 */
export class IpcChannelAnalyzer {
    private readonly channelLookup: Map<string, string>;
    private readonly handlersDir: string;
    private readonly projectRoot: string;

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
        this.handlersDir = path.join(
            projectRoot,
            "electron",
            "services",
            "ipc",
            "handlers"
        );
        this.channelLookup = this.loadChannelLookup();
    }

    /**
     * Extracts all IPC channel definitions from the source code
     */
    public analyzeChannels(): DomainChannelMap {
        const channels = this.extractChannelDefinitions();
        return this.groupChannelsByDomain(channels);
    }

    /**
     * Extracts individual channel definitions from current handler modules.
     */
    private extractChannelDefinitions(): IpcChannelDefinition[] {
        const channels: IpcChannelDefinition[] = [];
        const handlerFiles = readdirSync(this.handlersDir)
            .filter((fileName) => fileName.endsWith(".ts"))
            .sort((a, b) => a.localeCompare(b));

        for (const fileName of handlerFiles) {
            const filePath = path.join(this.handlersDir, fileName);
            const sourceCode = readFileSync(filePath, "utf8");
            const handlerRegex =
                /register\s*\(\s*(?<channelExpression>[A-Z_]+_CHANNELS\.[A-Za-z0-9_]+)/gu;

            let match;
            while ((match = handlerRegex.exec(sourceCode)) !== null) {
                const channelExpression = match.groups?.channelExpression ?? "";
                const channelName =
                    this.channelLookup.get(channelExpression) ??
                    channelExpression;
                const handlerCode = this.extractRegistrationSnippet(
                    sourceCode,
                    match.index
                );

                channels.push({
                    channel: channelName,
                    domain: this.inferDomainFromChannel(channelName),
                    handlerMethod: handlerCode.trim(),
                    hasParameters: this.detectParameters(handlerCode),
                    methodName: this.deriveMethodName(channelName),
                    returnType: this.inferReturnType(handlerCode),
                    sourceFile: path
                        .relative(this.projectRoot, filePath)
                        .replaceAll("\\", "/"),
                    validator: this.extractValidatorName(handlerCode),
                });
            }
        }

        return channels;
    }

    /**
     * Extract a short registration snippet for report context.
     */
    private extractRegistrationSnippet(
        sourceCode: string,
        startIndex: number
    ): string {
        const nextRegistrationIndex = sourceCode.indexOf(
            "\n    register(",
            startIndex + 1
        );
        const endIndex =
            nextRegistrationIndex === -1
                ? sourceCode.length
                : nextRegistrationIndex;

        return sourceCode.slice(startIndex, endIndex);
    }

    /**
     * Load channel constants from the shared preload contract source.
     */
    private loadChannelLookup(): Map<string, string> {
        const preloadTypesPath = path.join(
            this.projectRoot,
            "shared",
            "types",
            "preload.ts"
        );
        const sourceCode = readFileSync(preloadTypesPath, "utf8");
        const lookup = new Map<string, string>();
        const definitionRegex =
            /const\s+(?<constantName>[A-Z_]+_CHANNELS)_DEFINITION\b[^=]*=\s*\{(?<body>[\s\S]*?)\};/gu;

        let definitionMatch;
        while ((definitionMatch = definitionRegex.exec(sourceCode)) !== null) {
            const constantName = definitionMatch.groups?.constantName;
            const body = definitionMatch.groups?.body;
            if (!constantName || !body) {
                continue;
            }

            const propertyRegex =
                /(?<propertyName>[A-Za-z0-9_]+)\s*:\s*"(?<channelName>[^"]+)"/gu;
            let propertyMatch;
            while ((propertyMatch = propertyRegex.exec(body)) !== null) {
                const propertyName = propertyMatch.groups?.propertyName;
                const channelName = propertyMatch.groups?.channelName;
                if (!propertyName || !channelName) {
                    continue;
                }

                lookup.set(`${constantName}.${propertyName}`, channelName);
            }
        }

        return lookup;
    }

    /**
     * Groups channels by their inferred domain
     */
    private groupChannelsByDomain(
        channels: IpcChannelDefinition[]
    ): DomainChannelMap {
        const domainMap: DomainChannelMap = {};

        for (const channel of channels) {
            if (!domainMap[channel.domain]) {
                domainMap[channel.domain] = [];
            }
            const domainChannels = domainMap[channel.domain];
            if (domainChannels) {
                domainChannels.push(channel);
            }
        }

        return domainMap;
    }

    /**
     * Infers the domain from the channel name
     */
    private inferDomainFromChannel(channelName: string): string {
        if (channelName.startsWith("cloud-")) {
            return "cloud";
        }

        if (channelName.startsWith("diagnostics-")) {
            return "diagnostics";
        }

        if (
            channelName.includes("notification") ||
            channelName.startsWith("notify-")
        ) {
            return "notifications";
        }

        if (
            channelName.includes("sync") ||
            channelName === "get-sync-status" ||
            channelName === "request-full-sync"
        ) {
            return "stateSync";
        }

        // Monitor types (registry) channels
        if (
            channelName.includes("monitor-types") ||
            channelName.includes("validate-monitor") ||
            channelName.includes("format-monitor")
        ) {
            return "monitorTypes";
        }

        // Site-related channels
        if (channelName.includes("site")) {
            return "sites";
        }

        // Monitoring-related channels
        if (channelName.includes("monitor")) {
            return "monitoring";
        }

        if (
            channelName.includes("settings") ||
            channelName.includes("history")
        ) {
            return "settings";
        }

        // Data operations
        if (
            channelName.includes("data") ||
            channelName.includes("export") ||
            channelName.includes("import") ||
            channelName.includes("backup")
        ) {
            return "data";
        }

        // System operations (default for everything else)
        return "system";
    }

    /**
     * Derives a camelCase method name from the channel name
     */
    private deriveMethodName(channelName: string): string {
        // Convert kebab-case to camelCase
        return channelName
            .split("-")
            .map((part, index) =>
                index === 0
                    ? part
                    : part.charAt(0).toUpperCase() + part.slice(1)
            )
            .join("");
    }

    /**
     * Detects if the handler function takes parameters
     */
    private detectParameters(handlerCode: string): boolean {
        // Look for ...args: unknown[] pattern
        return (
            handlerCode.includes("...args") ||
            handlerCode.includes("args[") ||
            handlerCode.includes("IpcInvokeChannelParams")
        );
    }

    /**
     * Extracts the validator name from the validator code
     */
    private extractValidatorName(validatorCode: string): string | null {
        // Handle null validators
        if (validatorCode.trim() === "null") {
            return null;
        }

        // Extract validator function name (e.g., "DataHandlerValidators.exportData")
        const match = validatorCode.match(
            /(?<validatorClass>[A-Za-z]+HandlerValidators)\.(?<validatorMethod>[A-Za-z0-9]+)/
        );
        if (match?.groups) {
            return `${match.groups.validatorClass}.${match.groups.validatorMethod}`;
        }

        return validatorCode.trim();
    }

    /**
     * Attempts to infer the return type from handler code
     */
    private inferReturnType(handlerCode: string): string {
        // This is a simple heuristic - in a full implementation,
        // we'd use TypeScript compiler API for proper type analysis

        if (
            handlerCode.includes("return true") ||
            handlerCode.includes("boolean")
        ) {
            return "boolean";
        }

        if (
            handlerCode.includes("getSites") ||
            handlerCode.includes("Site[]")
        ) {
            return "Site[]";
        }

        if (handlerCode.includes("addSite") || handlerCode.includes("Site")) {
            return "Site";
        }

        if (
            handlerCode.includes("exportData") ||
            handlerCode.includes("importData")
        ) {
            return "string";
        }

        if (
            handlerCode.includes("getHistoryLimit") ||
            handlerCode.includes("number")
        ) {
            return "number";
        }

        // Default to unknown for complex types
        return "unknown";
    }

    /**
     * Generates a comprehensive report of all channels
     */
    public generateReport(): string {
        const domainMap = this.analyzeChannels();
        const totalChannels = Object.values(domainMap).flat().length;

        let report = `# IPC Channel Analysis Report\n\n`;
        report += `Total channels found: ${totalChannels}\n`;
        report += `Domains: ${Object.keys(domainMap).join(", ")}\n\n`;

        for (const [domain, channels] of Object.entries(domainMap)) {
            report += `## ${domain.charAt(0).toUpperCase() + domain.slice(1)} Domain (${channels.length} channels)\n\n`;

            for (const channel of channels) {
                report += `### \`${channel.channel}\`\n`;
                report += `- **Source**: \`${channel.sourceFile}\`\n`;
                report += `- **Method**: \`${channel.methodName}\`\n`;
                report += `- **Parameters**: ${channel.hasParameters ? "Yes" : "No"}\n`;
                report += `- **Validator**: ${channel.validator || "None"}\n`;
                report += `- **Return Type**: \`${channel.returnType}\`\n`;
                report += `- **Handler**: \`${channel.handlerMethod.slice(0, 50)}...\`\n\n`;
            }
        }

        return report;
    }

    /**
     * Exports the analysis results as JSON for use by other tools
     */
    public exportAsJson(): string {
        return JSON.stringify(this.analyzeChannels(), null, 2);
    }
}

/**
 * CLI interface for running the analysis
 */
export function runAnalysis(projectRoot: string): void {
    console.log("🔍 Analyzing IPC channels...\n");

    const analyzer = new IpcChannelAnalyzer(projectRoot);
    const report = analyzer.generateReport();
    const json = analyzer.exportAsJson();

    // Save reports
    const reportsDir = path.join(projectRoot, "docs", "preload-refactor");
    if (!existsSync(reportsDir)) {
        mkdirSync(reportsDir, { recursive: true });
    }

    writeFileSync(path.join(reportsDir, "ipc-channel-analysis.md"), report);
    writeFileSync(path.join(reportsDir, "ipc-channel-mapping.json"), json);

    console.log("📊 Analysis complete!");
    console.log(
        `📄 Report saved to: ${path.join(reportsDir, "ipc-channel-analysis.md")}`
    );
    console.log(
        `📋 JSON mapping saved to: ${path.join(reportsDir, "ipc-channel-mapping.json")}`
    );
    console.log(`\n${report}`);
}

/**
 * Check whether this module was executed as the CLI entrypoint.
 *
 * @returns Whether the script is running directly.
 */
function isDirectInvocation(): boolean {
    return (
        typeof process.argv[1] === "string" &&
        import.meta.url === pathToFileURL(process.argv[1]).href
    );
}

// If this file is run directly, execute the analysis
if (isDirectInvocation()) {
    const projectRoot = process.cwd();
    runAnalysis(projectRoot);
}
