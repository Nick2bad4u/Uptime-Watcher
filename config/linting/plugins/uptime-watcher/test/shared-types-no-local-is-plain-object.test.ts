import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("shared-types-no-local-is-plain-object",
    getPluginRule("shared-types-no-local-is-plain-object"),
    {
        invalid: [
            {
                code: "const isPlainObject = () => true;",
                errors: [{ messageId: "banned" }],
                filename: repoPath("shared", "types", "foo.ts"),
            },
        ],
        valid: [
            {
                code: "const isPlainObject = () => true;",
                filename: repoPath("shared", "utils", "typeGuards.ts"),
            },
        ],
    }
);
