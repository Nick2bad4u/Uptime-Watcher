import { createRuleTester,
getPluginRule,
repoPath } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/renderer-no-browser-dialogs",
    getPluginRule("renderer-no-browser-dialogs"),
    {
        invalid: [
            {
                code: "alert('x');",
                errors: [{ messageId: "avoidBrowserDialog" }],
                filename: repoPath("src", "app.ts"),
            },
        ],
        valid: [
            {
                code: "alert('x');",
                filename: repoPath("src", "test", "foo.test.ts"),
            },
        ],
    }
);
