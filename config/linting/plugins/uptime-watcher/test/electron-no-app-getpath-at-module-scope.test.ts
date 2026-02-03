import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/electron-no-app-getpath-at-module-scope",
    getPluginRule("electron-no-app-getpath-at-module-scope"),
    {
        invalid: [
            {
                code: "const dir = app.getPath('userData');",
                errors: [{ messageId: "disallowed" }],
                filename: repoPath(
                    "electron",
                    "services",
                    "database",
                    "DatabaseService.ts"
                ),
            },
            {
                code: "const name = app.getName();",
                errors: [{ messageId: "disallowed" }],
                filename: repoPath(
                    "electron",
                    "services",
                    "database",
                    "DatabaseService.ts"
                ),
            },
        ],
        valid: [
            {
                code: "function f() { return app.getPath('userData'); }",
                filename: repoPath(
                    "electron",
                    "services",
                    "database",
                    "DatabaseService.ts"
                ),
            },
            {
                code: "const f = () => app.getPath('userData');",
                filename: repoPath(
                    "electron",
                    "services",
                    "database",
                    "DatabaseService.ts"
                ),
            },
            {
                // Not in electron/ - rule should not run.
                code: "const dir = app.getPath('userData');",
                filename: repoPath("scripts", "some-script.mjs"),
            },
        ],
    }
);
