import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("monitor-fallback-consistency",
    getPluginRule("monitor-fallback-consistency"),
    {
        invalid: [
            {
                code: "const value = 123; export const FALLBACK_MONITOR_TYPE_OPTIONS = [{ label: 'HTTP', value }];",
                errors: [
                    { messageId: "missingMonitorType" },
                    { messageId: "valueShouldBeLiteral" },
                ],
                filename: repoPath("src", "constants.ts"),
            },
        ],
        valid: [
            {
                code: "export const FALLBACK_MONITOR_TYPE_OPTIONS = [{ label: 'HTTP' }];",
                filename: repoPath("src", "app.ts"),
            },
        ],
    }
);
