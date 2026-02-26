import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "electron-no-import-meta-dirname",
    getPluginRule("electron-no-import-meta-dirname"),
    {
        invalid: [
            {
                code: "const dir = import.meta.dirname;",
                errors: [{ messageId: "disallowed" }],
                filename: repoPath(
                    "electron",
                    "services",
                    "window",
                    "WindowService.ts"
                ),
            },
            {
                code: "const file = import.meta.filename;",
                errors: [{ messageId: "disallowed" }],
                filename: repoPath(
                    "electron",
                    "services",
                    "window",
                    "WindowService.ts"
                ),
            },
            {
                code: "const dir = import.meta['dirname'];",
                errors: [{ messageId: "disallowed" }],
                filename: repoPath(
                    "electron",
                    "services",
                    "window",
                    "WindowService.ts"
                ),
            },
        ],
        valid: [
            {
                code: "const url = import.meta.url;",
                filename: repoPath(
                    "electron",
                    "services",
                    "window",
                    "WindowService.ts"
                ),
            },
            {
                code: "const dir = path.dirname(fileURLToPath(import.meta.url));",
                filename: repoPath(
                    "electron",
                    "services",
                    "window",
                    "WindowService.ts"
                ),
            },
            {
                // Not in electron/ - rule should not run.
                code: "const dir = import.meta.dirname;",
                filename: repoPath("scripts", "some-script.mjs"),
            },
        ],
    }
);
