import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester, readTypedFixture, typedFixturePath } from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

ruleTester.run(
    "no-double-assertion-outside-tests",
    getPluginRule("no-double-assertion-outside-tests"),
    {
        invalid: [
            {
                code: readTypedFixture("no-double-assertion-outside-tests.invalid.ts"),
                errors: [{ messageId: "disallowDoubleAssertion" }],
                filename: typedFixturePath(
                    "no-double-assertion-outside-tests.invalid.ts"
                ),
            },
        ],
        valid: [
            {
                code: readTypedFixture(
                    "__tests__",
                    "no-double-assertion-outside-tests.valid.ts"
                ),
                filename: typedFixturePath(
                    "__tests__",
                    "no-double-assertion-outside-tests.valid.ts"
                ),
            },
        ],
    }
);
