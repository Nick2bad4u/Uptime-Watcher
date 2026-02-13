import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("electron-no-inline-ipc-channel-literal",
    getPluginRule("electron-no-inline-ipc-channel-literal"),
    {
        invalid: [
            {
                code: "registerStandardizedIpcHandler('my.channel', () => {});",
                errors: [{ messageId: "useSharedChannelConstant" }],
                filename: repoPath(
                    "electron",
                    "services",
                    "ipc",
                    "handlers",
                    "foo.ts"
                ),
            },
        ],
        valid: [
            {
                code: "const channel = 'my.channel'; registerStandardizedIpcHandler(channel, () => {});",
                filename: repoPath(
                    "electron",
                    "services",
                    "ipc",
                    "handlers",
                    "foo.ts"
                ),
            },
        ],
    }
);
