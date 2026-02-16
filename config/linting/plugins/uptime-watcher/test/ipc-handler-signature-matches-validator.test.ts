import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

ruleTester.run(
    "ipc-handler-signature-matches-validator",
    getPluginRule("ipc-handler-signature-matches-validator"),
    {
        invalid: [
            {
                code: readTypedFixture(
                    "ipc-handler-signature-matches-validator.invalid.ts"
                ),
                errors: [
                    { messageId: "handlerChannelContractMismatch" },
                    {
                        messageId: "validatorOutputNotAssignableToHandlerInput",
                    },
                ],
                filename: typedFixturePath(
                    "ipc-handler-signature-matches-validator.invalid.ts"
                ),
            },
        ],
        valid: [
            {
                code: readTypedFixture(
                    "ipc-handler-signature-matches-validator.valid.ts"
                ),
                filename: typedFixturePath(
                    "ipc-handler-signature-matches-validator.valid.ts"
                ),
            },
        ],
    }
);
