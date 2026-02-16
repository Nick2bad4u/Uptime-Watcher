import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

ruleTester.run(
    "prefer-type-fest-json-value",
    getPluginRule("prefer-type-fest-json-value"),
    {
        invalid: [
            {
                code: readTypedFixture(
                    "prefer-type-fest-json-value.invalid.ts"
                ),
                errors: [{ messageId: "preferJsonValue" }],
                filename: typedFixturePath(
                    "prefer-type-fest-json-value.invalid.ts"
                ),
            },
        ],
        valid: [
            {
                code: readTypedFixture("prefer-type-fest-json-value.valid.ts"),
                filename: typedFixturePath(
                    "prefer-type-fest-json-value.valid.ts"
                ),
            },
        ],
    }
);
