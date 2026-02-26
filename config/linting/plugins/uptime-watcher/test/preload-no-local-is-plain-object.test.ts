import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "preload-no-local-is-plain-object",
    getPluginRule("preload-no-local-is-plain-object"),
    {
        invalid: [
            {
                code: "const isPlainObject = () => true;",
                errors: [{ messageId: "banned" }],
                filename: repoPath("electron", "preload", "api", "foo.ts"),
            },
        ],
        valid: [
            {
                code: "const isPlainObject = () => true;",
                filename: repoPath("electron", "main.ts"),
            },
        ],
    }
);
