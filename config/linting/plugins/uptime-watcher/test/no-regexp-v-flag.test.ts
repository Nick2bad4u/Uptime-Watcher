import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("no-regexp-v-flag", getPluginRule("no-regexp-v-flag"), {
    invalid: [
        {
            code: "const re = /a/v;",
            errors: [{ messageId: "disallowed" }],
            filename: repoPath("src", "app.ts"),
        },
    ],
    valid: [
        {
            code: "const re = /a/u;",
            filename: repoPath("src", "app.ts"),
        },
    ],
});
