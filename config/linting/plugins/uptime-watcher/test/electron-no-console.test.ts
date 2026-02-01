import { createRuleTester,
getPluginRule,
repoPath } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/electron-no-console",
    getPluginRule("electron-no-console"),
    {
        invalid: [
            {
                code: "console.log('no');",
                errors: [{ messageId: "preferLogger" }],
                filename: repoPath("electron", "main.ts"),
            },
        ],
        valid: [
            {
                code: "console.log('ok');",
                filename: repoPath("src", "app.ts"),
            },
            {
                code: "console.log('ok');",
                filename: repoPath("electron", "test", "something.test.ts"),
            },
            {
                code: "logger.info('ok');",
                filename: repoPath("electron", "main.ts"),
            },
        ],
    }
);
