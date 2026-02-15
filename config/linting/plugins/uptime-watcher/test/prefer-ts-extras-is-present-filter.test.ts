import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

ruleTester.run(
    "prefer-ts-extras-is-present-filter",
    getPluginRule("prefer-ts-extras-is-present-filter"),
    {
        invalid: [
            {
                code: readTypedFixture(
                    "prefer-ts-extras-is-present-filter.invalid.ts"
                ),
                errors: [
                    { messageId: "preferTsExtrasIsPresentFilter" },
                    { messageId: "preferTsExtrasIsPresentFilter" },
                    { messageId: "preferTsExtrasIsPresentFilter" },
                ],
                filename: typedFixturePath(
                    "prefer-ts-extras-is-present-filter.invalid.ts"
                ),
            },
        ],
        valid: [
            {
                code: readTypedFixture(
                    "prefer-ts-extras-is-present-filter.valid.ts"
                ),
                filename: typedFixturePath(
                    "prefer-ts-extras-is-present-filter.valid.ts"
                ),
            },
        ],
    }
);
