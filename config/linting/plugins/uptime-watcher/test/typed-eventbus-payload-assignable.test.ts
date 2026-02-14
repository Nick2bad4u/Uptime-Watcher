import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester, readTypedFixture, typedFixturePath } from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

ruleTester.run(
    "typed-eventbus-payload-assignable",
    getPluginRule("typed-eventbus-payload-assignable"),
    {
        invalid: [
            {
                code: readTypedFixture(
                    "typed-eventbus-payload-assignable.invalid.ts"
                ),
                errors: [
                    { messageId: "emitPayloadNotAssignable" },
                    { messageId: "listenerNotAssignable" },
                ],
                filename: typedFixturePath(
                    "typed-eventbus-payload-assignable.invalid.ts"
                ),
            },
        ],
        valid: [
            {
                code: readTypedFixture(
                    "typed-eventbus-payload-assignable.valid.ts"
                ),
                filename: typedFixturePath(
                    "typed-eventbus-payload-assignable.valid.ts"
                ),
            },
        ],
    }
);
