import { createRuleTester,
getPluginRule,
repoPath } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/electron-preload-no-direct-ipc-renderer-usage",
    getPluginRule("electron-preload-no-direct-ipc-renderer-usage"),
    {
        invalid: [
            {
                code: "import { ipcRenderer } from 'electron';",
                errors: [{ messageId: "noDirectIpcRenderer" }],
                filename: repoPath("electron", "preload", "api", "foo.ts"),
            },
        ],
        valid: [
            {
                code: "import { ipcRenderer } from 'electron'; ipcRenderer.invoke('x');",
                filename: repoPath(
                    "electron",
                    "preload",
                    "core",
                    "bridgeFactory.ts"
                ),
            },
        ],
    }
);
