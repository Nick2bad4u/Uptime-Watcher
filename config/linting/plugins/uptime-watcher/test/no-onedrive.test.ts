import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("uptime-watcher/no-onedrive", getPluginRule("no-onedrive"), {
    invalid: [
        {
            code: "const p = 'C:/Users/Nick/OneDrive/file.txt';",
            errors: [{ messageId: "noOneDrive" }],
            filename: repoPath("src", "app.ts"),
        },
    ],
    valid: [
        {
            code: "const p = 'C:/Users/Nick/OneDrive/file.txt';",
            filename: repoPath("src", "test", "foo.test.ts"),
        },
    ],
});
