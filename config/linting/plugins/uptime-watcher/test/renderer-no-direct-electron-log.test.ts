import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "renderer-no-direct-electron-log",
    getPluginRule("renderer-no-direct-electron-log"),
    {
        invalid: [
            {
                code: "import log from 'electron-log/renderer';",
                errors: [{ messageId: "useRendererLogger" }],
                filename: repoPath("src", "components", "Foo.tsx"),
            },
        ],
        valid: [
            {
                code: "import log from 'electron-log/renderer';",
                filename: repoPath("src", "services", "logger.ts"),
            },
        ],
    }
);
