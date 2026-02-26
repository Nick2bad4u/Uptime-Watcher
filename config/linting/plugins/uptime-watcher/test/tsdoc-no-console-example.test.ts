import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "tsdoc-no-console-example",
    getPluginRule("tsdoc-no-console-example"),
    {
        invalid: [
            {
                code: "/**\n * Example:\n *\n * ```ts\n * console.log('x')\n * ```\n */\nexport function foo() {}",
                errors: [{ messageId: "replaceConsole" }],
                filename: repoPath("src", "app.ts"),
            },
        ],
        valid: [
            {
                code: "/**\n * Example:\n *\n * ```ts\n * foo()\n * ```\n */\nexport function foo() {}",
                filename: repoPath("src", "app.ts"),
            },
        ],
    }
);
