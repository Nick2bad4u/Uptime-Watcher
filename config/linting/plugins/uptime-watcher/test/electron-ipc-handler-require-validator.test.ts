import { createRuleTester,
getPluginRule,
repoPath } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/electron-ipc-handler-require-validator",
    getPluginRule("electron-ipc-handler-require-validator"),
    {
        invalid: [
            {
                code: "const channel = 'x'; registerStandardizedIpcHandler(channel, async () => 123);",
                errors: [{ messageId: "missingValidator" }],
                filename: repoPath(
                    "electron",
                    "services",
                    "ipc",
                    "handlers",
                    "foo.ts"
                ),
            },
        ],
        valid: [
            {
                code: "const channel = 'x'; registerStandardizedIpcHandler(channel, () => true, async () => 123);",
                filename: repoPath(
                    "electron",
                    "services",
                    "ipc",
                    "handlers",
                    "foo.ts"
                ),
            },
        ],
    }
);
