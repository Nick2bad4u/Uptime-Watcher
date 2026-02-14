import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester, readTypedFixture, typedFixturePath } from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

ruleTester.run(
    "prefer-ensure-error-return-type",
    getPluginRule("prefer-ensure-error-return-type"),
    {
        invalid: [
            {
                code: readTypedFixture("prefer-ensure-error-return-type.invalid.ts"),
                errors: [
                    { messageId: "catchVariableMustBeUnknown" },
                    { messageId: "ensureErrorShouldNotBeRecast" },
                ],
                filename: typedFixturePath(
                    "prefer-ensure-error-return-type.invalid.ts"
                ),
            },
        ],
        valid: [
            {
                code: readTypedFixture("prefer-ensure-error-return-type.valid.ts"),
                filename: typedFixturePath(
                    "prefer-ensure-error-return-type.valid.ts"
                ),
            },
        ],
    }
);
