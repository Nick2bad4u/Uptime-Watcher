import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "electron-preload-no-inline-ipc-channel-constant",
    getPluginRule("electron-preload-no-inline-ipc-channel-constant"),
    {
        invalid: [
            {
                code: "const FOO_CHANNEL = 'my.channel';",
                errors: [{ messageId: "noInlineChannelConstant" }],
                filename: repoPath("electron", "preload", "api", "foo.ts"),
            },
        ],
        valid: [
            {
                code: "const channel = 'my.channel'; const FOO_CHANNEL = channel;",
                filename: repoPath("electron", "preload", "api", "foo.ts"),
            },
        ],
    }
);
