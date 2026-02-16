import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

ruleTester.run(
    "prefer-type-fest-value-of",
    getPluginRule("prefer-type-fest-value-of"),
    {
        invalid: [
            {
                code: readTypedFixture("prefer-type-fest-value-of.invalid.ts"),
                errors: [
                    { messageId: "preferValueOf" },
                    { messageId: "preferValueOf" },
                    { messageId: "preferValueOf" },
                ],
                filename: typedFixturePath(
                    "prefer-type-fest-value-of.invalid.ts"
                ),
            },
        ],
        valid: [
            {
                code: readTypedFixture("prefer-type-fest-value-of.valid.ts"),
                filename: typedFixturePath(
                    "prefer-type-fest-value-of.valid.ts"
                ),
            },
        ],
    }
);
