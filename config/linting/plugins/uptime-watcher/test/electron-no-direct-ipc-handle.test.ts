import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("electron-no-direct-ipc-handle",
    getPluginRule("electron-no-direct-ipc-handle"),
    {
        invalid: [
            {
                code: "ipcMain.handle('x', () => {});",
                errors: [{ messageId: "useStandardizedRegistration" }],
                filename: repoPath("electron", "main.ts"),
            },
        ],
        valid: [
            {
                code: "ipcMain.handle('x', () => {});",
                filename: repoPath("electron", "services", "ipc", "utils.ts"),
            },
        ],
    }
);
