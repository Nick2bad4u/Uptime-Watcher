import { createRuleTester,
getPluginRule,
repoPath } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/renderer-no-preload-bridge-writes",
    getPluginRule("renderer-no-preload-bridge-writes"),
    {
        invalid: [
            {
                code: "window.electronAPI = {} as any;",
                errors: [{ messageId: "noBridgeWrites" }],
                filename: repoPath("src", "app.ts"),
            },
        ],
        valid: [
            {
                code: "window.electronAPI = {} as any;",
                filename: repoPath("src", "test", "foo.test.ts"),
            },
        ],
    }
);
