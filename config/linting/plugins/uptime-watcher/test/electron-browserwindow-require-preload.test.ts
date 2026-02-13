import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("electron-browserwindow-require-preload",
    getPluginRule("electron-browserwindow-require-preload"),
    {
        invalid: [
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
                errors: [{ messageId: "missingPreload" }],
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
    preload: getPreloadPath(),
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
        ],
    }
);
