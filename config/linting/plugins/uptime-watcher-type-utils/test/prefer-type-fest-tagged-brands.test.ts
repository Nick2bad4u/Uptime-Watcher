import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

ruleTester.run(
    "prefer-type-fest-tagged-brands",
    getPluginRule("prefer-type-fest-tagged-brands"),
    {
        invalid: [
            {
                code: readTypedFixture("prefer-type-fest-tagged-brands.invalid.ts"),
                errors: [{ messageId: "preferTaggedBrand" }],
                filename: typedFixturePath(
                    "prefer-type-fest-tagged-brands.invalid.ts"
                ),
            },
        ],
        valid: [
            {
                code: readTypedFixture("prefer-type-fest-tagged-brands.valid.ts"),
                filename: typedFixturePath(
                    "prefer-type-fest-tagged-brands.valid.ts"
                ),
            },
        ],
    }
);
