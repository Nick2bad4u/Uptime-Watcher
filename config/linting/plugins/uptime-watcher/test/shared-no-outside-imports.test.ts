import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("shared-no-outside-imports",
    getPluginRule("shared-no-outside-imports"),
    {
        invalid: [
            {
                code: "import { foo } from '@app/services/foo';",
                errors: [{ messageId: "noExternalImports" }],
                filename: repoPath("shared", "utils", "foo.ts"),
            },
        ],
        valid: [
            {
                code: "import { foo } from '@shared/utils/foo';",
                filename: repoPath("shared", "utils", "foo.ts"),
            },
        ],
    }
);
