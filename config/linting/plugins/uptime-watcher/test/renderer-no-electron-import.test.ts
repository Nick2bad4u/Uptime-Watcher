import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/renderer-no-electron-import",
    getPluginRule("renderer-no-electron-import"),
    {
        invalid: [
            {
                code: "import { ipcRenderer } from 'electron';",
                errors: [{ messageId: "forbiddenElectronImport" }],
                filename: repoPath("src", "app.ts"),
            },
        ],
        valid: [
            {
                code: "import { ipcRenderer } from 'electron';",
                filename: repoPath("src", "test", "foo.test.ts"),
            },
        ],
    }
);
