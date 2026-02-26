import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "electron-no-browserwindow-outside-windowservice",
    getPluginRule("electron-no-browserwindow-outside-windowservice"),
    {
        invalid: [
            {
                code: "const win = new BrowserWindow({});",
                errors: [{ messageId: "disallowed" }],
                filename: repoPath(
                    "electron",
                    "services",
                    "ipc",
                    "handlers",
                    "fakeWindow.ts"
                ),
            },
        ],
        valid: [
            {
                code: "const win = new BrowserWindow({});",
                filename: repoPath(
                    "electron",
                    "services",
                    "window",
                    "WindowService.ts"
                ),
            },
            {
                // Not in electron/ - rule should not run.
                code: "const win = new BrowserWindow({});",
                filename: repoPath("src", "components", "App.tsx"),
            },
        ],
    }
);
