import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("electron-no-webcontents-execute-javascript",
    getPluginRule("electron-no-webcontents-execute-javascript"),
    {
        invalid: [
            {
                code: "mainWindow.webContents.executeJavaScript('alert(1)');",
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
                code: "mainWindow.webContents.send('channel', { ok: true });",
                filename: repoPath(
                    "electron",
                    "services",
                    "window",
                    "WindowService.ts"
                ),
            },
            {
                // Not in electron/ - rule should not run.
                code: "mainWindow.webContents.executeJavaScript('alert(1)');",
                filename: repoPath("scripts", "some-script.mjs"),
            },
        ],
    }
);
