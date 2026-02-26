import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "electron-open-devtools-require-dev-only",
    getPluginRule("electron-open-devtools-require-dev-only"),
    {
        invalid: [
            {
                code: `
class WindowService {
  createMainWindow() {
    this.mainWindow.webContents.openDevTools();
  }
}
`.trim(),
                errors: [{ messageId: "mustBeDevOnly" }],
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
class WindowService {
  loadDevelopmentContent() {
    this.mainWindow.webContents.openDevTools();
  }
}
`.trim(),
                filename: repoPath(
                    "electron",
                    "services",
                    "window",
                    "WindowService.ts"
                ),
            },
            {
                code: `
function openDevToolsInDev(win) {
  win.webContents.openDevTools();
}
`.trim(),
                filename: repoPath(
                    "electron",
                    "services",
                    "window",
                    "WindowService.ts"
                ),
            },
            {
                // Not in electron/ - rule should not run.
                code: "mainWindow.webContents.openDevTools();",
                filename: repoPath("src", "components", "App.tsx"),
            },
        ],
    }
);
