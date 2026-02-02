import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/electron-cloud-providers-drift-guards",
    getPluginRule("electron-cloud-providers-drift-guards"),
    {
        invalid: [
            {
                code: "isAllowedExternalOpenUrl('https://example.com');",
                errors: [{ messageId: "bannedCall" }],
                filename: repoPath(
                    "electron",
                    "services",
                    "cloud",
                    "providers",
                    "foo.ts"
                ),
            },
        ],
        valid: [
            {
                code: "isAllowedExternalOpenUrl('https://example.com');",
                filename: repoPath(
                    "electron",
                    "services",
                    "cloud",
                    "providers",
                    "openExternal",
                    "openExternalAllowedUrls.ts"
                ),
            },
        ],
    }
);
