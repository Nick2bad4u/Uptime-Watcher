import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "renderer-no-process-env",
    getPluginRule("renderer-no-process-env"),
    {
        invalid: [
            {
                code: "const env = process.env.NODE_ENV;",
                errors: [{ messageId: "disallowed" }],
                filename: repoPath("src", "components", "App.tsx"),
            },
        ],
        valid: [
            {
                code: "const mode = import.meta.env.MODE;",
                filename: repoPath("src", "components", "App.tsx"),
            },
            {
                // Src/test is excluded
                code: "process.env.NODE_ENV = 'test';",
                filename: repoPath("src", "test", "global-setup.ts"),
            },
            {
                // Not in src/ - rule should not run.
                code: "process.env.NODE_ENV = 'test';",
                filename: repoPath(
                    "shared",
                    "test",
                    "utils",
                    "environment.backend.test.ts"
                ),
            },
        ],
    }
);
