import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "electron-no-inline-ipc-channel-type-argument",
    getPluginRule("electron-no-inline-ipc-channel-type-argument"),
    {
        invalid: [
            {
                code: "const channel = 'x'; registerStandardizedIpcHandler<\"my.channel\">(channel, () => {});",
                errors: [{ messageId: "noInlineTypeChannel" }],
                filename: repoPath("electron", "services", "ipc", "utils.ts"),
            },
        ],
        valid: [
            {
                code: "const channel = 'x'; registerStandardizedIpcHandler<string>(channel, () => {});",
                filename: repoPath("electron", "services", "ipc", "utils.ts"),
            },
        ],
    }
);
