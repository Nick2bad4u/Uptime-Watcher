import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

ruleTester.run(
    "prefer-type-fest-promisable",
    getPluginRule("prefer-type-fest-promisable"),
    {
        invalid: [
            {
                code: readTypedFixture("prefer-type-fest-promisable.invalid.ts"),
                errors: [
                    { messageId: "preferPromisable" },
                    { messageId: "preferPromisable" },
                    { messageId: "preferPromisable" },
                ],
                filename: typedFixturePath(
                    "prefer-type-fest-promisable.invalid.ts"
                ),
            },
        ],
        valid: [
            {
                code: readTypedFixture("prefer-type-fest-promisable.valid.ts"),
                filename: typedFixturePath("prefer-type-fest-promisable.valid.ts"),
            },
        ],
    }
);
