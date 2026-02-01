import { createRuleTester,
getPluginRule,
repoPath } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/no-local-error-normalizers",
    getPluginRule("no-local-error-normalizers"),
    {
        invalid: [
            {
                code: "function ensureError(error) { return error; }",
                errors: [{ messageId: "noLocalErrorNormalizers" }],
                filename: repoPath("src", "app.ts"),
            },
        ],
        valid: [
            {
                code: "function ensureError(error) { return error; }",
                filename: repoPath("shared", "utils", "errorHandling.ts"),
            },
        ],
    }
);
