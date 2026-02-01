import { createRuleTester,
getPluginRule,
repoPath } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("uptime-watcher/no-local-identifiers", getPluginRule("no-local-identifiers"), {
    invalid: [
        {
            code: "const forbidden = 1;",
            errors: [{ messageId: "banned" }],
            filename: repoPath("src", "app.ts"),
            options: [
                {
                    banned: [
                        {
                            name: "forbidden",
                            kinds: ["variable"],
                        },
                    ],
                },
            ],
        },
    ],
    valid: [
        {
            code: "const allowed = 1;",
            filename: repoPath("src", "app.ts"),
            options: [
                {
                    banned: [
                        {
                            name: "forbidden",
                            kinds: ["variable"],
                        },
                    ],
                },
            ],
        },
    ],
});
