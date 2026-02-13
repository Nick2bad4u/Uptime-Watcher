import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("renderer-no-ipc-renderer-usage",
    getPluginRule("renderer-no-ipc-renderer-usage"),
    {
        invalid: [
            {
                code: "ipcRenderer.invoke('x');",
                errors: [{ messageId: "noIpcRenderer" }],
                filename: repoPath("src", "app.ts"),
            },
        ],
        valid: [
            {
                code: "ipcRenderer.invoke('x');",
                filename: repoPath("src", "test", "foo.test.ts"),
            },
        ],
    }
);
