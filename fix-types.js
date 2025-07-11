const fs = require("fs");
const path = require("path");

// Default values for required properties
const MONITOR_DEFAULTS = {
    responseTime: -1,
    monitoring: true,
    checkInterval: 300000,
    timeout: 5000,
    retryAttempts: 3,
};

const SITE_DEFAULTS = {
    name: "Test Site",
    monitoring: true,
};

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // Fix Monitor objects - add missing required properties
    const monitorPatterns = [
        // Pattern 1: Monitor with type and other props but missing required ones
        {
            regex: /(\{\s*(?:[^}]*(?:type:\s*"(?:http|port)"[^}]*|id:\s*"[^"]*"[^}]*|status:\s*"[^"]*"[^}]*))+[^}]*)\}/g,
            fix: (match) => {
                const obj = match.slice(1, -1); // Remove { }
                const props = [];

                // Parse existing properties
                const existingProps = new Set();
                const propMatches = obj.match(/(\w+):\s*[^,}]+/g) || [];
                propMatches.forEach((prop) => {
                    const propName = prop.split(":")[0].trim();
                    existingProps.add(propName);
                });

                // Add missing required properties
                Object.entries(MONITOR_DEFAULTS).forEach(([key, value]) => {
                    if (!existingProps.has(key)) {
                        if (typeof value === "string") {
                            props.push(`${key}: "${value}"`);
                        } else {
                            props.push(`${key}: ${value}`);
                        }
                    }
                });

                if (props.length > 0) {
                    return `{${obj}, ${props.join(", ")}}`;
                }
                return match;
            },
        },
    ];

    // Fix Site objects - add missing monitoring property
    content = content.replace(
        /(\{\s*identifier:\s*"[^"]*",\s*(?:name:\s*"[^"]*",\s*)?monitors:\s*\[[^\]]*\])\s*\}/g,
        (match, inner) => {
            if (!inner.includes("monitoring:")) {
                return `{${inner}, monitoring: true}`;
            }
            return match;
        }
    );

    // Fix undefined assignments to required properties
    const undefinedFixes = [
        { regex: /timeout:\s*undefined/g, replacement: `timeout: ${MONITOR_DEFAULTS.timeout}` },
        { regex: /retryAttempts:\s*undefined/g, replacement: `retryAttempts: ${MONITOR_DEFAULTS.retryAttempts}` },
        { regex: /checkInterval:\s*undefined/g, replacement: `checkInterval: ${MONITOR_DEFAULTS.checkInterval}` },
        { regex: /responseTime:\s*undefined/g, replacement: `responseTime: ${MONITOR_DEFAULTS.responseTime}` },
    ];

    undefinedFixes.forEach(({ regex, replacement }) => {
        if (regex.test(content)) {
            content = content.replace(regex, replacement);
            modified = true;
        }
    });

    // Apply monitor pattern fixes
    monitorPatterns.forEach(({ regex, fix }) => {
        content = content.replace(regex, fix);
    });

    if (modified || content !== fs.readFileSync(filePath, "utf8")) {
        fs.writeFileSync(filePath, content, "utf8");
        console.log(`Fixed: ${filePath}`);
    }
}

// Get all test files
const testFiles = [
    "src/test/additional-uncovered-lines-fixed.test.ts",
    "src/test/additional-uncovered-lines.test.ts",
    "src/test/App.test.tsx",
    "src/test/MonitorSelector.test.tsx",
    "src/test/SiteDetails.basic.test.tsx",
    "src/test/SiteDetails.comprehensive.test.tsx",
    "src/test/SiteDetails.simple.test.tsx",
    "src/test/SiteDetails.test.tsx",
    "src/test/SiteDetails.uncovered.test.tsx",
    "src/test/siteStatus.test.ts",
    "src/test/stores/sites/SiteService.test.ts",
    "src/test/stores/sites/statusUpdateHandler.test.ts",
    "src/test/stores/sites/useSiteOperations.test.ts",
    "src/test/stores/sites/useSitesState.test.ts",
    "src/test/stores/sites/useSitesStore.edgeCases.test.ts",
    "src/test/stores/sites/useSitesStore.getSites.test.ts",
    "src/test/stores/sites/useSitesStore.integration.test.ts",
    "src/test/stores/sites/useSiteSync.test.ts",
    "src/test/types.test.ts",
    "src/test/useSite.test.ts",
    "src/test/useSiteAnalytics.test.ts",
    "src/test/useSiteDetails.comprehensive.test.ts",
    "src/test/useSiteDetails.uncovered.test.ts",
    "src/test/useSiteMonitor.test.ts",
    "src/test/useSitesStore.test.ts",
    "src/test/useSitesStore.uncovered.test.ts",
    "src/test/useStatsStore.test.ts",
];

console.log("Starting bulk type fixes...");
testFiles.forEach((file) => {
    const fullPath = path.join(__dirname, file);
    fixFile(fullPath);
});
console.log("Bulk fixes completed!");
