import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("electron-no-dialog-sync",
    getPluginRule("electron-no-dialog-sync"),
    {
        invalid: [
            {
                code: "dialog.showSaveDialogSync({});",
                errors: [{ messageId: "disallowed" }],
                filename: repoPath("electron", "main.ts"),
            },
            {
                code: "dialog.showOpenDialogSync({});",
                errors: [{ messageId: "disallowed" }],
                filename: repoPath("electron", "main.ts"),
            },
            {
                code: "dialog.showMessageBoxSync({ message: 'Hello' });",
                errors: [{ messageId: "disallowed" }],
                filename: repoPath("electron", "main.ts"),
            },
        ],
        valid: [
            {
                code: "await dialog.showSaveDialog({});",
                filename: repoPath("electron", "main.ts"),
            },
            {
                // Not in electron/ - rule should not run.
                code: "dialog.showMessageBoxSync({});",
                filename: repoPath("scripts", "some-script.mjs"),
            },
        ],
    }
);
