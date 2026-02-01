import { createRuleTester,
getPluginRule,
repoPath } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/electron-no-direct-ipc-handler-wrappers",
    getPluginRule("electron-no-direct-ipc-handler-wrappers"),
    {
        invalid: [
            {
                code: "import { withIpcHandler } from './x'; withIpcHandler(() => {});",
                errors: [{ messageId: "preferStandardRegistration" }],
                filename: repoPath("electron", "main.ts"),
            },
        ],
        valid: [
            {
                code: "withIpcHandler(() => {});",
                filename: repoPath("electron", "services", "ipc", "utils.ts"),
            },
        ],
    }
);
