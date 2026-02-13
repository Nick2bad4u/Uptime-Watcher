import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("electron-no-shell-open-external",
    getPluginRule("electron-no-shell-open-external"),
    {
        invalid: [
            {
                code: "await shell.openExternal('https://example.com');",
                errors: [{ messageId: "disallowed" }],
                filename: repoPath(
                    "electron",
                    "services",
                    "misc",
                    "someFile.ts"
                ),
            },
        ],
        valid: [
            {
                // Allowed in the centralized wrapper.
                code: "await shell.openExternal(args.normalizedUrl);",
                filename: repoPath(
                    "electron",
                    "services",
                    "shell",
                    "openExternalUtils.ts"
                ),
            },
            {
                // Not in electron/ - rule should not run.
                code: "await shell.openExternal('https://example.com');",
                filename: repoPath("scripts", "some-script.mjs"),
            },
        ],
    }
);
