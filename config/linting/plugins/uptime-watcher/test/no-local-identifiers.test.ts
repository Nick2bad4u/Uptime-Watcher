import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("no-local-identifiers", getPluginRule("no-local-identifiers"), {
    invalid: [
        {
            code: "const forbidden = 1;",
            errors: [{ messageId: "banned" }],
            filename: repoPath("src", "app.ts"),
            options: [
                {
                    banned: [
                        {
                            kinds: ["variable"],
                            name: "forbidden",
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
                            kinds: ["variable"],
                            name: "forbidden",
                        },
                    ],
                },
            ],
        },
    ],
});
