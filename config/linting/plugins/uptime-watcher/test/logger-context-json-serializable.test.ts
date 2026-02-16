import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

ruleTester.run(
    "logger-context-json-serializable",
    getPluginRule("logger-context-json-serializable"),
    {
        invalid: [
            {
                code: readTypedFixture(
                    "logger-context-json-serializable.invalid.ts"
                ),
                errors: [
                    {
                        messageId: "loggerContextMustBeJsonSerializable",
                    },
                ],
                filename: typedFixturePath(
                    "logger-context-json-serializable.invalid.ts"
                ),
            },
        ],
        valid: [
            {
                code: readTypedFixture(
                    "logger-context-json-serializable.valid.ts"
                ),
                filename: typedFixturePath(
                    "logger-context-json-serializable.valid.ts"
                ),
            },
        ],
    }
);
