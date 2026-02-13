import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("no-call-identifiers",
    getPluginRule("no-call-identifiers"),
    {
        invalid: [
            {
                code: "danger();",
                errors: [{ messageId: "bannedCall" }],
                filename: repoPath("src", "app.ts"),
                options: [
                    {
                        banned: [{ name: "danger" }],
                    },
                ],
            },
        ],
        valid: [
            {
                code: "safe();",
                filename: repoPath("src", "app.ts"),
                options: [
                    {
                        banned: [{ name: "danger" }],
                    },
                ],
            },
        ],
    }
);
