import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

ruleTester.run(
    "prefer-type-fest-unknown-record",
    getPluginRule("prefer-type-fest-unknown-record"),
    {
        invalid: [
            {
                code: readTypedFixture(
                    "prefer-type-fest-unknown-record.invalid.ts"
                ),
                errors: [{ messageId: "preferUnknownRecord" }],
                filename: typedFixturePath(
                    "prefer-type-fest-unknown-record.invalid.ts"
                ),
            },
        ],
        valid: [
            {
                code: readTypedFixture(
                    "prefer-type-fest-unknown-record.valid.ts"
                ),
                filename: typedFixturePath(
                    "prefer-type-fest-unknown-record.valid.ts"
                ),
            },
        ],
    }
);
