import { createRuleTester,
getPluginRule,
repoPath } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/electron-prefer-read-process-env",
    getPluginRule("electron-prefer-read-process-env"),
    {
        invalid: [
            {
                code: "const x = process.env.MY_VAR;",
                errors: [{ messageId: "preferReadProcessEnv" }],
                filename: repoPath("electron", "main.ts"),
            },
        ],
        valid: [
            {
                code: "const x = readProcessEnv('MY_VAR');",
                filename: repoPath("electron", "main.ts"),
            },
        ],
    }
);
