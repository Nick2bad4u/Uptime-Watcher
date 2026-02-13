import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("test-no-mock-return-value-constructors",
    getPluginRule("test-no-mock-return-value-constructors"),
    {
        invalid: [
            {
                code: "const BrowserWindow = vi.fn(); BrowserWindow.mockReturnValue({});",
                errors: [{ messageId: "banned" }],
                filename: repoPath("src", "test", "foo.test.ts"),
            },
        ],
        valid: [
            {
                code: "const browserWindow = vi.fn(); browserWindow.mockReturnValue({});",
                filename: repoPath("src", "test", "foo.test.ts"),
            },
        ],
    }
);
