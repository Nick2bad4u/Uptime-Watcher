import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/renderer-no-import-internal-service-utils",
    getPluginRule("renderer-no-import-internal-service-utils"),
    {
        invalid: [
            {
                code: "import { createIpcServiceHelpers } from '@app/services/utils/createIpcServiceHelpers';",
                errors: [{ messageId: "noInternalUtils" }],
                filename: repoPath("src", "components", "Foo.tsx"),
            },
        ],
        valid: [
            {
                code: "import { createIpcServiceHelpers } from '@app/services/utils/createIpcServiceHelpers';",
                filename: repoPath("src", "services", "foo.ts"),
            },
        ],
    }
);
