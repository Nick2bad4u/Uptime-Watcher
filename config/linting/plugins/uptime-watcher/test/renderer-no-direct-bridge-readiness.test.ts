import { createRuleTester,
getPluginRule,
repoPath } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/renderer-no-direct-bridge-readiness",
    getPluginRule("renderer-no-direct-bridge-readiness"),
    {
        invalid: [
            {
                code: "waitForElectronBridge();",
                errors: [{ messageId: "preferServiceHelpers" }],
                filename: repoPath("src", "components", "Foo.tsx"),
            },
        ],
        valid: [
            {
                code: "waitForElectronBridge();",
                filename: repoPath(
                    "src",
                    "services",
                    "utils",
                    "createIpcServiceHelpers.ts"
                ),
            },
        ],
    }
);
