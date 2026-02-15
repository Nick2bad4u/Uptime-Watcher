import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

ruleTester.run(
    "prefer-ts-extras-object-has-own",
    getPluginRule("prefer-ts-extras-object-has-own"),
    {
        invalid: [
            {
                code: readTypedFixture(
                    "prefer-ts-extras-object-has-own.invalid.ts"
                ),
                errors: [
                    { messageId: "preferTsExtrasObjectHasOwn" },
                    { messageId: "preferTsExtrasObjectHasOwn" },
                    { messageId: "preferTsExtrasObjectHasOwn" },
                ],
                filename: typedFixturePath(
                    "prefer-ts-extras-object-has-own.invalid.ts"
                ),
            },
        ],
        valid: [
            {
                code: readTypedFixture(
                    "prefer-ts-extras-object-has-own.valid.ts"
                ),
                filename: typedFixturePath(
                    "prefer-ts-extras-object-has-own.valid.ts"
                ),
            },
        ],
    }
);
