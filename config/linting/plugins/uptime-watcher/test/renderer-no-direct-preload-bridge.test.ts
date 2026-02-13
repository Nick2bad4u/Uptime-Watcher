import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("renderer-no-direct-preload-bridge",
    getPluginRule("renderer-no-direct-preload-bridge"),
    {
        invalid: [
            {
                code: "window.electronAPI;",
                errors: [{ messageId: "avoidDirectBridge" }],
                filename: repoPath("src", "components", "Foo.tsx"),
            },
        ],
        valid: [
            {
                code: "window.electronAPI;",
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
