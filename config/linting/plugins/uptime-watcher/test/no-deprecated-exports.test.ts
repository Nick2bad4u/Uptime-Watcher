import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("no-deprecated-exports",
    getPluginRule("no-deprecated-exports"),
    {
        invalid: [
            {
                code: "const oldValue = 1;\n/** @deprecated */\nexport { oldValue };",
                errors: [{ messageId: "noDeprecatedExports" }],
                filename: repoPath("src", "app.ts"),
            },
        ],
        valid: [
            {
                code: "export const newValue = 1;",
                filename: repoPath("src", "app.ts"),
            },
        ],
    }
);
