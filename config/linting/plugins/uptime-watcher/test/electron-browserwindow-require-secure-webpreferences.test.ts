import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "electron-browserwindow-require-secure-webpreferences",
    getPluginRule("electron-browserwindow-require-secure-webpreferences"),
    {
        invalid: [
            {
                code: `
new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    sandbox: true,
    nodeIntegration: true,
    webviewTag: false,
  },
});
`.trim(),
                errors: [{ messageId: "incorrectSetting" }],
                filename: repoPath(
                    "electron",
                    "services",
                    "window",
                    "WindowService.ts"
                ),
            },
            {
                code: `
new BrowserWindow({
  webPreferences: {
    sandbox: true,
    nodeIntegration: false,
    webviewTag: false,
  },
});
`.trim(),
                errors: [{ messageId: "missingSetting" }],
                filename: repoPath(
                    "electron",
                    "services",
                    "window",
                    "WindowService.ts"
                ),
            },
            {
                code: `
new BrowserWindow({
  width: 1,
});
`.trim(),
                errors: [{ messageId: "missingWebPreferences" }],
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
                code: `
new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    sandbox: true,
    nodeIntegration: false,
    webviewTag: false,
  },
});
`.trim(),
                filename: repoPath(
                    "electron",
                    "services",
                    "window",
                    "WindowService.ts"
                ),
            },
            {
                // Not in electron/test - rule should not run.
                code: "new BrowserWindow();",
                filename: repoPath("electron", "test", "utils.test.ts"),
            },
        ],
    }
);
