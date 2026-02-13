import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("renderer-no-direct-networking",
    getPluginRule("renderer-no-direct-networking"),
    {
        invalid: [
            {
                code: "fetch('https://example.com');",
                errors: [{ messageId: "noDirectNetworking" }],
                filename: repoPath("src", "components", "Foo.tsx"),
            },
        ],
        valid: [
            {
                code: "fetch('https://example.com');",
                filename: repoPath("src", "services", "api.ts"),
            },
        ],
    }
);
