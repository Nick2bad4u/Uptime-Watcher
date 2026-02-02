import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/electron-no-renderer-import",
    getPluginRule("electron-no-renderer-import"),
    {
        invalid: [
            {
                code: "import { foo } from '@app/services/foo';",
                errors: [{ messageId: "noRendererImport" }],
                filename: repoPath("electron", "main.ts"),
            },
        ],
        valid: [
            {
                code: "import { foo } from '@shared/utils/foo';",
                filename: repoPath("electron", "main.ts"),
            },
        ],
    }
);
