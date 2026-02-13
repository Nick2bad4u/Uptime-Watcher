import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("electron-no-ad-hoc-error-code-suffix",
    getPluginRule("electron-no-ad-hoc-error-code-suffix"),
    {
        invalid: [
            {
                // eslint-disable-next-line no-template-curly-in-string
                code: "const code = 'E_FOO'; const suffix = code ? ` (${code})` : '';",
                errors: [{ messageId: "banned" }],
                filename: repoPath("electron", "services", "foo.ts"),
            },
        ],
        valid: [
            {
                // eslint-disable-next-line no-template-curly-in-string
                code: "const code = 'E_FOO'; const suffix = code ? `(${code})` : '';",
                filename: repoPath("electron", "services", "foo.ts"),
            },
            {
                // eslint-disable-next-line no-template-curly-in-string
                code: "const code = 'E_FOO'; const suffix = code ? ` (${code})` : '';",
                filename: repoPath(
                    "electron",
                    "services",
                    "shell",
                    "openExternalUtils.ts"
                ),
            },
        ],
    }
);
