import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/prefer-try-get-error-code",
    getPluginRule("prefer-try-get-error-code"),
    {
        invalid: [
            {
                code: "const error = new Error('x'); const code = (error as { code?: string }).code;",
                errors: [{ messageId: "prefer" }],
                filename: repoPath("src", "app.ts"),
            },
        ],
        valid: [
            {
                code: "const error = new Error('x'); const code = tryGetErrorCode(error);",
                filename: repoPath("src", "app.ts"),
            },
        ],
    }
);
