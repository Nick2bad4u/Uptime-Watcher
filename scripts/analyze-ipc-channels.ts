/**
 * IPC Channel Analysis Tool for Preload Refactoring
 *
 * @remarks
 * This tool analyzes the existing IpcService.ts to extract all channel
 * definitions and automatically generates domain mappings for the modular
 * preload architecture. It ensures perfect alignment between backend IPC
 * handlers and frontend API methods.
 *
 * @packageDocumentation
 */

import * as fs from "fs";
import * as path from "path";

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
}

/**
 * Grouped channel definitions by domain
 */
export interface DomainChannelMap {
    [domain: string]: IpcChannelDefinition[];
}

/**
 * Analyzes the IpcService.ts file to extract all channel definitions
 */
export class IpcChannelAnalyzer {
    private readonly ipcServicePath: string;
    private readonly sourceCode: string;

    constructor(projectRoot: string) {
        this.ipcServicePath = path.join(
            projectRoot,
            "electron",
            "services",
            "ipc",
            "IpcService.ts"
        );
        this.sourceCode = fs.readFileSync(this.ipcServicePath, "utf-8");
    }

    /**
     * Extracts all IPC channel definitions from the source code
     */
    public analyzeChannels(): DomainChannelMap {
        const channels = this.extractChannelDefinitions();
        return this.groupChannelsByDomain(channels);
    }

    /**
     * Extracts individual channel definitions from
     * registerStandardizedIpcHandler calls
     */
    private extractChannelDefinitions(): IpcChannelDefinition[] {
        const channels: IpcChannelDefinition[] = [];

        // Regex to match registerStandardizedIpcHandler calls
        const handlerRegex =
            /registerStandardizedIpcHandler\s*\(\s*["']([^"']+)["']\s*,\s*([^,]+),\s*([^,]+),/g;

        let match;
        while ((match = handlerRegex.exec(this.sourceCode)) !== null) {
            const [
                ,
                channelName,
                handlerCode,
                validatorCode,
            ] = match;

            channels.push({
                channel: channelName,
                domain: this.inferDomainFromChannel(channelName),
                methodName: this.deriveMethodName(channelName),
                hasParameters: this.detectParameters(handlerCode),
                validator: this.extractValidatorName(validatorCode),
                returnType: this.inferReturnType(handlerCode),
                handlerMethod: handlerCode.trim(),
            });
        }

        return channels;
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
            domainMap[channel.domain].push(channel);
        }

        return domainMap;
    }

    /**
     * Infers the domain from the channel name
     */
    private inferDomainFromChannel(channelName: string): string {
        // Site-related channels
        if (channelName.includes("site")) {
            return "sites";
        }

        // Monitoring-related channels
        if (channelName.includes("monitor") && !channelName.includes("types")) {
            return "monitoring";
        }

        // Monitor types (registry) channels
        if (
            channelName.includes("monitor-types") ||
            channelName.includes("validate-monitor") ||
            channelName.includes("format-monitor")
        ) {
            return "monitorTypes";
        }

        // Data operations
        if (
            channelName.includes("data") ||
            channelName.includes("export") ||
            channelName.includes("import") ||
            channelName.includes("backup") ||
            channelName.includes("history") ||
            channelName.includes("settings")
        ) {
            return "data";
        }

        // State synchronization
        if (channelName.includes("sync") || channelName.includes("status")) {
            return "stateSync";
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
        return handlerCode.includes("...args") || handlerCode.includes("args[");
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
        const match = validatorCode.match(/([A-Za-z]+)\.([A-Za-z]+)/);
        if (match) {
            return `${match[1]}.${match[2]}`;
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
                report += `- **Method**: \`${channel.methodName}\`\n`;
                report += `- **Parameters**: ${channel.hasParameters ? "Yes" : "No"}\n`;
                report += `- **Validator**: ${channel.validator || "None"}\n`;
                report += `- **Return Type**: \`${channel.returnType}\`\n`;
                report += `- **Handler**: \`${channel.handlerMethod.substring(0, 50)}...\`\n\n`;
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
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(reportsDir, "ipc-channel-analysis.md"), report);
    fs.writeFileSync(path.join(reportsDir, "ipc-channel-mapping.json"), json);

    console.log("📊 Analysis complete!");
    console.log(
        `📄 Report saved to: ${path.join(reportsDir, "ipc-channel-analysis.md")}`
    );
    console.log(
        `📋 JSON mapping saved to: ${path.join(reportsDir, "ipc-channel-mapping.json")}`
    );
    console.log("\n" + report);
}

// If this file is run directly, execute the analysis
if (require.main === module) {
    const projectRoot = process.cwd();
    runAnalysis(projectRoot);
}
