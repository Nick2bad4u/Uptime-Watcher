import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "renderer-no-window-open",
    getPluginRule("renderer-no-window-open"),
    {
        invalid: [
            {
                code: "window.open('https://example.com');",
                errors: [{ messageId: "avoidWindowOpen" }],
                filename: repoPath("src", "components", "Foo.tsx"),
            },
        ],
        valid: [
            {
                code: "window.location.href = 'https://example.com';",
                filename: repoPath("src", "components", "Foo.tsx"),
            },
            {
                code: "window.open('https://example.com');",
                filename: repoPath("src", "test", "something.test.tsx"),
            },
        ],
    }
);
