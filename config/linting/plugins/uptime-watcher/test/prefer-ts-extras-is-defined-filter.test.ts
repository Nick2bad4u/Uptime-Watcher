import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

ruleTester.run(
    "prefer-ts-extras-is-defined-filter",
    getPluginRule("prefer-ts-extras-is-defined-filter"),
    {
        invalid: [
            {
                code: readTypedFixture(
                    "prefer-ts-extras-is-defined-filter.invalid.ts"
                ),
                errors: [
                    { messageId: "preferTsExtrasIsDefinedFilter" },
                    { messageId: "preferTsExtrasIsDefinedFilter" },
                    { messageId: "preferTsExtrasIsDefinedFilter" },
                ],
                filename: typedFixturePath(
                    "prefer-ts-extras-is-defined-filter.invalid.ts"
                ),
            },
        ],
        valid: [
            {
                code: readTypedFixture(
                    "prefer-ts-extras-is-defined-filter.valid.ts"
                ),
                filename: typedFixturePath(
                    "prefer-ts-extras-is-defined-filter.valid.ts"
                ),
            },
        ],
    }
);
