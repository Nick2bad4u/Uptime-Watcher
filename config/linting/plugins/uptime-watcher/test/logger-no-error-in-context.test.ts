import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/logger-no-error-in-context",
    getPluginRule("logger-no-error-in-context"),
    {
        invalid: [
            {
                code: "logger.error('x', { error: err });",
                errors: [{ messageId: "avoidErrorContext" }],
                filename: repoPath("src", "app.ts"),
            },
        ],
        valid: [
            {
                code: "logger.error('x', err);",
                filename: repoPath("src", "app.ts"),
            },
            {
                code: "logger.error('x', err);",
                filename: repoPath("src", "services", "logger.ts"),
            },
        ],
    }
);
