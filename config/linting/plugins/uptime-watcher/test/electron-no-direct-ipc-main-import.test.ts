import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("electron-no-direct-ipc-main-import",
    getPluginRule("electron-no-direct-ipc-main-import"),
    {
        invalid: [
            {
                code: "import { ipcMain } from 'electron';",
                errors: [{ messageId: "avoidIpcMain" }],
                filename: repoPath("electron", "main.ts"),
            },
        ],
        valid: [
            {
                code: "import { ipcMain } from 'electron';",
                filename: repoPath("electron", "services", "ipc", "utils.ts"),
            },
        ],
    }
);
